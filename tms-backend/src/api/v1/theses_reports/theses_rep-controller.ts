import { Request, Response, Router } from "express";
import { IThesisReport, ThesesRepModel, ThesesRep_t } from "./theses_rep-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import { ThesisModel } from "../theses/theses-model";

export class ThesesRepController extends ResourceController<IThesisReport> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(ThesesRepModel);
  }
  /**
   * Apply all routes for theses reports
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .post("/", this.postThesisReport)
      .patch("/addComment/:reportId", this.updateReportComment);

    return router;
  }

  /**
   * Create a New Thesis Report
   * @param req
   * @param res
   */
  postThesisReport = async (req: Request, res: Response) => {
    this.logger.debug("postThesisReport request");
    // Create a new Thesis Report
    try {
      const report = new ThesesRepModel({
        title: req.body.title,
        description: req.body.description,
        isFinal: req.body.isFinal,
        student: req.body.userId,
        report_files: req.body.report_files,
        date: Date.now(),
      });

      const saved_report = await report.save();
      res.send({ report: report._id });
    } catch (err) {
      // console.log(err);
      res.status(StatusCodes.BAD_REQUEST).send(err);
    }
  };

  /**
   * Add comment
   * @param req
   * @param res
   */
  updateReportComment = async (req: Request, res: Response) => {
    this.logger.debug("updateReportComment request");
    const updated_report = await ThesesRepModel.updateOne(
      { _id: req.params.reportId },
      { $push: { [req.body.attr]: req.body.value } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
      });
  };
}
