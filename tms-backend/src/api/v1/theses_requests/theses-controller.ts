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
      .get("/", this.getThesesRequests)
      .get("/student/:userId", this.getThesesRequests)
      .post("/", this.postThesis)
      .patch("/:requestId", this.updateThesisReq)
      .patch("/reapply/:requestId", this.updateThesisReqFiles);

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
    const student_requests = await this.modelSchema
      .find({ student: req.params.userId })
      .then((data) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
      });
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
        throw this.logger.error(
          "An error occurred: Thesis not found in database!",
        );
      }

      const thesis_request = new ThesesReqModel({
        thesis: req.body.thesis,
        student: req.body.student,
        professor: professor,
        required_files: req.body.required_files,
        date: Date.now(),
      });

      const saved_thesis_request = await thesis_request.save();
      res.status(StatusCodes.OK).send({ thesis_request: thesis_request._id });
    } catch (err) {
      this.logger.error("" + err);
      res.status(StatusCodes.BAD_REQUEST).send(err);
    }
  };

  /**
   * Update thesis by id (for status)
   * @param req
   * @param res
   */
  updateThesisReq = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("updateThesisReq request");
    const updated_request = await this.modelSchema.updateOne(
      { _id: req.params.requestId },
      { $set: { status: req.body.status } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Update thesis by id (Reapply files)
   * @param req
   * @param res
   */
  updateThesisReqFiles = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("updateThesisReqFiles request");
    this.logger.debug("Id: ", req.params.requestId);
    this.logger.debug("Files: ", req.body.files);
    const updated_request = await this.modelSchema.updateOne(
      { _id: req.params.requestId },
      { $set: { required_files: req.body.files } },
    )
      .then((data: any) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
      });
  };
}
