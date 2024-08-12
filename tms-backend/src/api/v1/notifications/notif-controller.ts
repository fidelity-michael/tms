import { Request, Response, Router } from "express";
import {
  INotification,
  NotificationModel,
  Notification_t,
} from "./notif-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import { ObjectId } from "mongoose";
import config from "config";
import nodemailer from "nodemailer";
import { UserModel } from "../users/user-model";
import { DIContainer, SocketServer, SocketsService } from "../../../services";
import io from "socket.io";
import { ObjectType } from "typescript";
import { UserSockets } from "../users/user-controller";

// TODO: Add socket event (from routes/notifications.js) in services folder
// TODO: Fix socket implementation and integrate it with current structure

export class NotificationController extends ResourceController<INotification> {
  private logger: Logger = new Logger();
  private socketServer: SocketServer;
  private users: UserSockets; // TODO: Check if correct
  constructor() {
    super(NotificationModel);
    this.socketServer = DIContainer.get(SocketsService).socketServer;

    if(this.socketServer) // NOTE: Check this piece of code. users logic maybe incorrect
      this.users = this.socketServer.users;
    else
      this.users = {};
  }
  /**
   * Apply all routes for notifications
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getNotifications)
      .get("/initialize", this.initNotification)
      .get("/:userId", this.getNotificationById)
      .get("/all/:userId", this.getNotifications)
      .get("/some/:userId", this.getLimitedNotifications) // TODO: add patch function with notification id here
      .post("/", this.postNotification)
      .patch("/:notificationId", this.updateNotification)
      .delete("/:id", this.deleteNotification);

    return router;
  }

  /**
   * In all of the methods below, we are using the super class methods to perform the CRUD operations.
   * Request and Response are passed to the super class methods so that they can be extracted and used.
   * In case you need to do any preprocessing (e.g., filter a body's field) you can do it before calling the super class methods.
   */
  /**
   * Sends a message containing all tasks back as a response
   * @param req
   * @param res
   */
  getNotifications = async (req: Request, res: Response) => {
    this.logger.debug("getNotification request");
    // you can pre-process the request here before passing it to the super class method

    const allNotifications = await this.getAll(req, res);
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(allNotifications);
  };

  getLimitedNotifications = async (req: Request, res: Response) => {
    this.logger.debug("getSomeNotifications request");

    const limitedNotifications = await this.getLimited(req, res, 20);

    return res.status(StatusCodes.OK).json(limitedNotifications);
  };

  /**
   * Create a new notification
   * @param req
   * @param res
   */
  postNotification = async (req: Request, res: Response) => {
    this.logger.debug("postNotification request");
    // TODO: FIX THIS EMIT SOCKET SITUATION HERE
    try {
      const notification = new NotificationModel({
        title: req.body.title,
        message: req.body.message,
        receiver: req.body.receiver,
        type: req.body.type,
        date: Date.now(),
      });

      const saved_notification = await notification.save();
      res.send({ notification: notification._id });

      let receiverSocketIds: {[index: string]: any} = [];
      // let receiverSocketIds: string[] = [];

      //we get all the current socketIds of the receiver and the sender
      Object.keys(this.users).forEach((key: string) => {
        //key is the socket.id of the receiver

        //for receiver
        if (this.users[key] === notification.receiver) {
          receiverSocketIds.push(key);
        }
      });

      this.logger.debug("receivers: ", receiverSocketIds, "users: ", this.users)

      //emit to all of the receiver sockets
      // TODO: Check socket usability
      if (receiverSocketIds.length > 0) {
        receiverSocketIds.forEach((socketId: string) => {
          const socket = this.socketServer.io;
          socket.to(socketId).emit("newNotification");
        });
      }

      this.sendEmail(req.body.receiver, req.body.title, req.body.message);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }

    // return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Delete notification by id
   * @param req
   * @param res
   */
  deleteNotification = async (req: Request, res: Response) => {
    this.logger.debug("deleteNotification request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.delete(req.params.id, req, res);
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Update notification by id
   * @param req
   * @param res
   */
  updateNotification = async (req: Request, res: Response) => {
    this.logger.debug("updateNotification request");
    const updated_notification = await NotificationModel.updateOne(
      { _id: req.params.notificationId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        console.log("Server internal error occurred on updateNotification!");
      });
    return res.status(StatusCodes.OK).json(updated_notification);
  };

  /**
   * Get single task by id
   * @param req
   * @param res
   */
  getNotificationById = async (req: Request, res: Response) => {
    this.logger.debug("getNotificationById request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.getOne(req.params.userId, req, res);

    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Initialize items
   * @param req
   * @param res
   */
  initNotification = async (req: Request, res: Response) => {
    this.logger.debug("Initialize notification request");

    const NotificationToInsert: Notification_t[] = [];

    await NotificationModel.insertMany(NotificationToInsert)
      .then((docs) => {
        res.json(docs);
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      });
  };

  sendEmail = async (receiverId: any, title: string, message: string) => {
    const receiver = await UserModel.findOne({ _id: receiverId });
    const receiverEmail: string = receiver!.email; // ! because email is never null

    //apo config file
    const senderEmail: string = config.get("AdminMailCredentials.email");
    const senderPswd: string = config.get("AdminMailCredentials.password");
    const senderService: string = config.get("AdminMailCredentials.service");

    //prevent error
    if (
      senderEmail.length === 0 ||
      senderPswd.length === 0 ||
      senderService.length === 0
    ) {
      return;
    } else {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: senderService,
        auth: {
          user: senderEmail,
          pass: senderPswd,
        },
        tls: { rejectUnauthorized: false },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: senderEmail,
        to: receiverEmail, //receiver email
        subject: title,
        text: message,
        html: "<b>" + message + "</b>",
      });

      this.logger.debug("Mail sent successfully!");
    }
  };
}
