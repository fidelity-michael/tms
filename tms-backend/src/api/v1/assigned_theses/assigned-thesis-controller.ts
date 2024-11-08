import { Request, Response, Router } from "express";
import { IAssignedThesis, AssignedThesisModel } from "./assigned-thesis-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class AssignedThesisController extends ResourceController<IAssignedThesis> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(AssignedThesisModel);
  }
  /**
   * Apply all routes for assigned theses
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getAssignedTheses)
      .get("/assigned_thesis/:userId", this.getUsersAssignedThesis)
      .get("/supervised/:userId", this.getProfessorsAssignedThesis)
      .post("/", this.postAssignedThesis)
      .patch("/:userId", this.patchAssignedThesis)
      .patch("/thesis/:userId", this.patchAssignedThesisGrade)
      .patch("/updateAttribute/:thesisId", this.patchAssignedThesisAttr)
      .delete("/:thesisId", this.deleteThesis)
      .delete("/delete/:assignedThesisId", this.deleteAssignedThesis);
    return router;
  }

  /**
   * Sends a message containing all Assigned theses back as a response
   * @param req
   * @param res
   */
  getAssignedTheses = async (req: Request, res: Response) => {
    // NOTE: Works as intented
    this.logger.debug("getAssignedThesis request");
    const allAssignedThesis = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allAssignedThesis);
  };

  /**
   * Creates a new assigned thesis and send back the unique _id
   * @param req
   * @param res
   */
  postAssignedThesis = async (req: Request, res: Response) => {
    // NOTE: Works as intented
    this.logger.debug("postAssignedThesis request");
    const assigned_thesis = await this.create(req, res);
    return res
      .status(StatusCodes.OK)
      .json({ assigned_thesis: assigned_thesis._id });
  };

  /**
   * Patches a assigned thesis
   * @param req
   * @param res
   */
  patchAssignedThesis = async (req: Request, res: Response) => {
    this.logger.debug("patchAssignedThesis request");
    const updated_assigned_thesis = await AssignedThesisModel.updateOne(
      { student: req.params.userId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data: any) => {
        res.json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Patches a assigned thesis
   * @param req
   * @param res
   */
  patchAssignedThesisGrade = async (req: Request, res: Response) => {
    const updated_assigned_thesis = await AssignedThesisModel.findOneAndUpdate(
      { student: req.params.userId },
      {
        $set: {
          title_greek: req.body.title_greek,
          title_english: req.body.title_english,
          grade: req.body.grade,
        },
      },
    )
      .then((data) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Remove Assigned Thesis with param the thesis
   * @param req
   * @param res
   */
  deleteThesis = async (req: Request, res: Response) => {
    this.logger.debug("deleteThesis request"); // NOTE: _id is used to delete a resource
    const thesis = await this.delete(req.params.thesisId, req, res);
    return res.status(StatusCodes.OK).json(thesis);
  };

  /**
   * Remove Assigned Thesis with assigned thesis id as param
   * @param req
   * @param res
   */
  deleteAssignedThesis = async (req: Request, res: Response) => {
    this.logger.debug("deleteAssignedThesis request");
    const assigned_thesis = await this.delete(
      req.params.assignedThesisId,
      req,
      res,
    );
    return res.status(StatusCodes.OK).json(assigned_thesis);
  };

  /**
   * Get user's thesis info
   * @param req
   * @param res
   */
  getUsersAssignedThesis = async (req: Request, res: Response) => {
    this.logger.debug("getUsersAssignedThesis request");
    const assigned_thesis = await AssignedThesisModel
      .findOne({
        student: req.params.userId,
      })
      .then((data: any) => {
        return res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Get a professor's supervised thesis info
   * @param req
   * @param res
   */
  getProfessorsAssignedThesis = async (req: Request, res: Response) => {
    this.logger.debug("getProfessorsAssignedThesis request");
    const assigned_thesis = await AssignedThesisModel
      .find({
        supervisor: { $elemMatch: { $eq: req.params.userId } },
      })
      .then((data) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Update an assigned thesis attribute
   * @param req
   * @param res
   */
  patchAssignedThesisAttr = async (req: Request, res: Response) => {
    const updatedAssignedThesis = await AssignedThesisModel.updateOne(
      { _id: req.params.thesisId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data: any) => {
        res.json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };
}
