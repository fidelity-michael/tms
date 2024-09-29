import { Request, Response, Router } from "express";
import { IThesis, ThesisModel } from "./theses-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class ThesisController extends ResourceController<IThesis> {
  private logger: Logger = new Logger();
  constructor() {
    super(ThesisModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/:thesisId", this.getThesisById)
      .post("/", this.postThesis)
      .patch("/:thesisId", this.patchThesis)
      .delete("/:thesisId", this.deleteThesis);
    return router;
  }

  /**
   * Get user's thesis info
   * @param req
   * @param res
   */
  getThesisById = async (req: Request, res: Response) => {
    this.logger.debug("getThesisById request");
    await ThesisModel.find({ _id: req.params.thesisId })
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        this.logger.error("" + StatusCodes.INTERNAL_SERVER_ERROR);
      });
  };

  /**
   * Creates a new thesis and send back the unique _id
   * @param req
   * @param res
   */
  postThesis = async (req: Request, res: Response) => {
    // NOTE: Works as intented
    this.logger.debug("postThesis request");
    const thesis = await this.create(req, res);
    return res.status(StatusCodes.OK).json({ thesis: thesis._id });
  };

  /**
   * Patches a assigned thesis
   * @param req
   * @param res
   */
  patchThesis = async (req: Request, res: Response) => {
    await ThesisModel.updateOne(
      { _id: req.params.thesisId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        console.log("Server internal error occurred!");
      });
  };

  /**
   * Remove Thesis with param the thesisId
   * @param req
   * @param res
   */
  deleteThesis = async (req: Request, res: Response) => {
    this.logger.debug("deleteThesis request"); // NOTE: _id is used to delete a resource
    const thesis = await this.delete(req.params.thesisId, req, res);
    return res.status(StatusCodes.OK).json(thesis);
  };
}
