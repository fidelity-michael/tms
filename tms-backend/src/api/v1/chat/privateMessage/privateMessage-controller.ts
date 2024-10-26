import { Request, Response, Router } from "express";
import { IPMessage, PrivateConversation } from "./privateMessage-model";
import { ResourceController } from "../../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../shared/utils/logger";

export class PrivateMessageController extends ResourceController<IPMessage> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(PrivateConversation);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/:userId", this.getUserConversations)
      .post("/", this.postMessage)
      .patch("/readLastMessage/:chatId", this.updateReadStatus)
      .patch("/updateLastMessage/:chatId", this.updateLastMessage)
      .delete("/:id", this.deleteMessage);
    return router;
  }

  /**
   * Get all private conversations of a user
   * @param req
   * @param res
   */
  getUserConversations = async (req: Request, res: Response) => {
    const conversation = await PrivateConversation.find({
      $or: [{ user1: req.params.userId }, { user2: req.params.userId }],
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err);
      });
  };

  /**
   * Creates a new private message
   * @param req
   * @param res
   */
  postMessage = async (req: Request, res: Response) => {
    try {
      const newPrivateConvo = new PrivateConversation({
        user1: req.body.user1,
        user2: req.body.user2,
        date: Date.now(),
      });

      const savedConvo = await newPrivateConvo.save();
      res.send(newPrivateConvo);
    } catch (err) {
      this.logger.error("Error in post private message: " + err);
      res.status(400).send(err);
    }
  };

  /**
   * Update a conversation's lastMessage property
   * @param req
   * @param res
   */
  updateLastMessage = async (req: Request, res: Response) => {
    var lastMessage = req.body.lastMessage;
    delete lastMessage.text; //exclude text

    const newDate = await PrivateConversation.updateOne(
      { _id: req.params.chatId },
      { $set: { lastMessage: lastMessage } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err);
      });
  };

  /**
   * Update a conversation's lastMessage as read property
   * @param req
   * @param res
   */
  updateReadStatus = async (req: Request, res: Response) => {
    const newDate = await PrivateConversation.updateOne(
      { _id: req.params.chatId },
      { $push: { "lastMessage.read": req.body.userId } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error(StatusCodes.INTERNAL_SERVER_ERROR + " " + err);
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
