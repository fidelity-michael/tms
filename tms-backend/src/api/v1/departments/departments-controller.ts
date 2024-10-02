import { Request, Response, Router } from "express";
import {
  IDepartment,
  DepartmentModel,
  Department_t,
} from "./departments-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class DepartmentController extends ResourceController<IDepartment> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(DepartmentModel);
    this.checkAndInitialize();
  }
  /**
   * Apply all routes for department
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getDepartments)
      .post("/", this.postDepartment)
      .patch("/:id", this.updateDepartment)
      .delete("/:departmentId", this.deleteDepartment);

    return router;
  }

  /**
   * Sends a message containing all Departments back as a response
   * @param req
   * @param res
   */
  getDepartments = async (req: Request, res: Response) => {
    this.logger.debug("getDepartments request");
    const allDepartments = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allDepartments);
  };

  /**
   * Creates a new department and sends back the unique _id of
   * the created entity
   * @param req
   * @param res
   */
  postDepartment = async (req: Request, res: Response) => {
    this.logger.debug("postDepartment request");
    const department = await this.create(req, res);
    return res.status(StatusCodes.OK).json({ department: department._id });
  };

  /**
   * Update department by id
   * @param req
   * @param res
   */
  updateDepartment = async (req: Request, res: Response) => {
    this.logger.debug("updateDepartment request");
    const department = await this.update(req.params.id, req.body.blacklist, req, res);
    return res.status(StatusCodes.OK).json(department);
  };

  /**
   * Delete department by id
   * @param req
   * @param res
   */
  deleteDepartment = async (req: Request, res: Response) => {
    this.logger.debug("deleteDepartment request");
    const deletedDepartment = await this.delete(
      req.params.departmentId,
      req,
      res,
    );
    return res.status(StatusCodes.OK).json(deletedDepartment);
  };

  /**
   * Initialize items
   * @param req
   * @param res
   */
  initializeDepartments = async () => {
    this.logger.debug("Initialize departments request");

    const departmentToInsert: Department_t[] = [
      {
        name: "Computer Science Department",
        university: "University of Crete",
        phone: "+30 281 039 3504",
        email: "csd@csd.uoc.gr",
      },
    ];

    await DepartmentModel.insertMany(departmentToInsert)
      .then((docs) => {
        this.logger.success("Departments initialized successfully!");
      })
      .catch((err) => {
        this.logger.error(err);
      });
  };

  // Check if Model is empty, if empty initialize document
  private async checkAndInitialize(): Promise<void> {
    try {
      const data = await DepartmentModel.findOne({});
      if (!data) {
        this.initializeDepartments();
      }
    } catch (error) {
      this.logger.error("Error ocurred in department initialization: ", error);
    }
  }
}
