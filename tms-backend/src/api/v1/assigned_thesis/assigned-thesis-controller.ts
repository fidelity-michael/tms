import { Request, Response, Router } from "express";
import { IAssignedThesis, AssignedThesisModel } from "./assigned-thesis-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class AssignedThesisController extends ResourceController<IAssignedThesis> {
  private logger: Logger = new Logger();
  constructor() {
    super(AssignedThesisModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getAssignedThesis)
      // .get('/:id', this.getAreaById)
      .post("/", this.postAssignedThesis)
      .patch("/:userId", this.patchAssignedThesis);
    // .put('/:id', this.updateArea)
    // .delete('/:id', this.deleteArea);

    return router;
  }

  /**
   * Sends a message containing all Assigned thesis back as a response
   * @param req
   * @param res
   */
  getAssignedThesis = async (req: Request, res: Response) => {
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
      { student: req.params.userId }, // NOTE: userId is the name of the user. (If student have the same name, the first one found is updated)
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data: any) => {
        res.json(data);
      })
      .catch(() => {
        this.logger.error("" + StatusCodes.INTERNAL_SERVER_ERROR)
      });
  };

  /**
   * Delete task by id
   * @param req
   * @param res
   */
  deleteArea = async (req: Request, res: Response) => {
    this.logger.debug("deleteArea request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.delete(req.params.id, req, res); // WARN: maybe areaId
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Update task by id
   * @param req
   * @param res
   */
  updateArea = async (req: Request, res: Response) => {
    this.logger.debug("updateArea request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.update(req.params.id, req.body.blacklist, req, res); // WARN: check for correct params
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Get single task by id
   * @param req
   * @param res
   */
  getAreaById = async (req: Request, res: Response) => {
    this.logger.debug("getAreaById request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.getOne(req.params.id, req, res);

    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };
}
