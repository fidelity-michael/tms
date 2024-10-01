import { Request, Response, Router } from "express";
import { IMessage, MessageModel } from "./message-model";
import { ResourceController } from "../../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../shared/utils/logger";
import CryptoJS from "crypto-js";

export class MessageController extends ResourceController<IMessage> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(MessageModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/data/:messageId", this.getMessageData)
      .get("/:chatId", this.getMessagesByChatId)
      .post("/", this.postMessage)
      .put("/:messageId", this.updateMessage)
      .patch("/read/:messageId", this.updateReadStatus)
      .patch("/addFiles/:messageId", this.patchMessage)
      .delete("/:id", this.deleteMessage);
    return router;
  }

  /**
   * Get all messages from a single chatId
   * @param req
   * @param res
   */
  getMessagesByChatId = async (req: Request, res: Response) => {
    this.logger.debug("getMessagesByChatId request");
    const messages = await MessageModel.find({ chatId: req.params.chatId })
      .then((data) => {
        //decrypt the message
        data.map((message) => {
          var decrypted = CryptoJS.AES.decrypt(
            message.text,
            process.env.AES_KEY as string,
          );
          message.text = decrypted.toString(CryptoJS.enc.Utf8);
        });

        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err)
      });
  };

  /**
   * Get a message data by its id
   * @param req
   * @param res
   */
  getMessageData = async (req: Request, res: Response) => {
    const message = await MessageModel.find({ _id: req.params.messageId })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err)
      });
  };

  /**
   * Creates a new message
   * @param req
   * @param res
   */
  postMessage = async (req: Request, res: Response) => {
    this.logger.debug("postMessage request");
    try {
      var newMessage = new MessageModel({
        sender: req.body.sender,
        chatId: req.body.chatId,
        text: req.body.text,
        read: [],
        date: Date.now(),
      });

      //encrypt the message
      newMessage.text = CryptoJS.AES.encrypt(
        newMessage.text,
        process.env.AES_KEY as string,
      ).toString();

      const savedMessage = await newMessage.save();
      res.send(savedMessage);
    } catch (err) {
      this.logger.error("Post message error: " + err);
      res.status(400).send(err);
    }
  };

  /**
   * Update message by id
   * @param req
   * @param res
   */
  updateMessage = async (req: Request, res: Response) => {
    this.logger.debug("updateMessage request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.update(req.params.id, req.body.blacklist, req, res); // WARN: check for correct params
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Mark message as read by a user
   * @param req
   * @param res
   */
  updateReadStatus = async (req: Request, res: Response) => {
    const read = await MessageModel.updateOne(
      { _id: req.params.messageId },
      { $push: { read: req.body.userId } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err)
      });
  };

  /**
   * Add file to message
   * @param req
   * @param res
   */
  patchMessage = async (req: Request, res: Response) => {
    this.logger.debug("patch(fileNames): " + req.body.fileNames);
    const addFile = await MessageModel.updateOne(
      { _id: req.params.messageId },
      { $set: { files: req.body.fileNames } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err)
      });
  };

  /**
   * Delete message by id
   * @param req
   * @param res
   */
  deleteMessage = async (req: Request, res: Response) => {
    this.logger.debug("deleteMessage request");
    const msg = await this.delete(req.params.messageId, req, res);
    return res.status(StatusCodes.OK).json(msg);
  };
}
