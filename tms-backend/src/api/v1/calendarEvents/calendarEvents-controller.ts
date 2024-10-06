import { Request, Response, Router } from "express";
import {
  ICalendarEvents,
  CalendarEventsModel,
  CalendarEvents_t,
} from "./calendarEvents-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class CalendarEventsController extends ResourceController<ICalendarEvents> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(CalendarEventsModel);
  }
  /**
   * Apply all routes for calendar events
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getCalEvents)
      .get("/:userId", this.getCalendarEventsById)
      .post("/", this.postCalendarEvents);

    return router;
  }

  /**
   * Sends a message containing all calendar events back as a response
   * @param req
   * @param res
   */
  getCalEvents = async (req: Request, res: Response) => {
    this.logger.debug("getArea request");
    const allAreas = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allAreas);
  };

  /**
   * Get all calendar events of a user
   * @param req
   * @param res
   */
  getCalendarEventsById = async (req: Request, res: Response) => {
    this.logger.debug("getCalendarEventsById request");
    const calEvents = await CalendarEventsModel.find({
      userId: req.params.userId,
    });
    return res.status(StatusCodes.OK).json(calEvents);
  };

  /**
   * Creates a new calendar event
   * @param req
   * @param res
   */
  postCalendarEvents = async (req: Request, res: Response) => {
    this.logger.debug("postCalendarEvents request");
    const calEvent = await this.create(req, res);
    return res.status(StatusCodes.OK).json(calEvent);
  };
}
