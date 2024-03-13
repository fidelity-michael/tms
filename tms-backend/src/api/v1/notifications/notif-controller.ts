import { Request, Response, Router } from 'express';
import { INotification, NotificationModel, Notification_t } from './notif-model';
import { ResourceController } from '../../shared';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/utils/logger';
import { ObjectId } from 'mongoose';
import config from 'config';
import nodemailer from 'nodemailer';

export class NotificationController extends ResourceController<INotification>{
  private logger: Logger = new Logger();
  constructor() {
    super(NotificationModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get('/', this.getNotification)
      .get('/initialize', this.initNotification)
      .get('/:id', this.getNotificationById)
      .post('/', this.postNotification)
      .put('/:id', this.updateNotification)
      .delete('/:id', this.deleteNotification);

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
  getNotification = async (req: Request, res: Response) => {
    this.logger.debug('getNotification request');
    // you can pre-process the request here before passing it to the super class method
    const allNotifications = await this.getAll(req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(allNotifications);
  }

  /**
   * Creates a new task
   * @param req
   * @param res
   */
  postNotification = async (req: Request, res: Response) => {
    this.logger.debug('postNotification request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.create(req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Delete task by id
   * @param req
   * @param res
   */
  deleteNotification = async (req: Request, res: Response) => {
    this.logger.debug('deleteNotification request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.delete(req.params.id, req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Update task by id
   * @param req
   * @param res
   */
  updateNotification = async (req: Request, res: Response) => {
    this.logger.debug('updateNotification request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.update(req.params.id, req.body.blacklist, req, res); // WARN: check for correct params
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Get single task by id
   * @param req
   * @param res
   */
  getNotificationById = async (req: Request, res: Response) => {
    this.logger.debug('getNotificationById request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.getOne(req.params.id, req, res);

    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Initialize items
   * @param req
   * @param res
   */
  initNotification = async (req: Request, res: Response) => {
    this.logger.debug('Initialize notification request');

    const NotificationToInsert: Notification_t[] = [];

    await NotificationModel.insertMany(NotificationToInsert)
      .then((docs) => {
        res.json(docs);
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
      })

  }

  sendEmail = async (receiverId: ObjectId, title: string, message: string) => {

    // TODO: Add User model so it can be searched.
    const receiver = await User.findOne({ _id: receiverId });
    const receiverEmail = receiver.email

    //apo config file
    const senderEmail = config.get('AdminMailCredentials.email');
    const senderPswd = config.get('AdminMailCredentials.password');
    const senderService = config.get('AdminMailCredentials.service')

    //prevent error
    if (senderEmail.length === 0 || senderPswd.length === 0 || senderService.length === 0) {
      return
    } else {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: senderService,
        auth: {
          user: senderEmail,
          pass: senderPswd,
        },
        tls: { rejectUnauthorized: false }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: senderEmail,
        to: receiverEmail,  //receiver email
        subject: title,
        text: message,
        html: "<b>" + message + "</b>"
      });

      console.log("Mail sent successfully!");
    }

  }
}
