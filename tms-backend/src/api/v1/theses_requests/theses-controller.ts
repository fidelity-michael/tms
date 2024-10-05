import { Request, Response, Router } from "express";
import { IThesesReq, ThesesReqModel, ThesesReq_t } from "./theses-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import { ThesisModel } from "../theses/theses-model";

export class ThesesReqController extends ResourceController<IThesesReq> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(ThesesReqModel);
  }
  /**
   * Apply all routes for theses requests
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/student/:userId", this.getThesesRequests)
      .post("/", this.postThesis)
      .put("/:id", this.updateArea)
      .delete("/:id", this.deleteArea);

    return router;
  }

  /**
   * Sends a message containing all theses requests of a student
   * back as a response
   * @param req
   * @param res
   */
  getThesesRequests = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("getThesesRequests request");
    const allThesesReq = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allThesesReq);
  };

  /**
   * Creates a new thesis
   * @param req
   * @param res
   */
  postThesis = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("postThesis request");
    try {
      const thesis = await ThesisModel.find({ _id: req.body.thesis });
      let professor = "";
      if (thesis[0]) {
        professor = thesis[0].professor;
      } else {
        throw this.logger.error("An error occurred: Thesis not found in database!");
      }

      const thesis_request = await this.create(req, res);
      return res
        .status(StatusCodes.OK)
        .json({ thesis_request: thesis_request._id });
    } catch (err) {
      this.logger.error("" + err);
      res.status(StatusCodes.BAD_REQUEST).send(err);
    }
  };

  /**
   * Delete area by id
   * @param req
   * @param res
   */
  deleteArea = async (req: Request, res: Response) => {
    this.logger.debug("deleteArea request");
    // you can pre-process the request here before passing it to the super class method
    const area = await this.delete(req.params.id, req, res); // WARN: maybe areaId
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(area);
  };

  /**
   * Update area by id
   * @param req
   * @param res
   */
  updateArea = async (req: Request, res: Response) => {
    this.logger.debug("updateArea request");
    const area = await this.update(req.params.id, req.body.blacklist, req, res);
    return res.status(StatusCodes.OK).json(area);
  };
}
