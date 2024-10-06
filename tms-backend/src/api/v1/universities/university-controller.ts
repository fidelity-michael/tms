import { Request, Response, Router } from "express";
import { IUniversity, UniversityModel, University_t } from "./university-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class UniversityController extends ResourceController<IUniversity> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(UniversityModel);
    this.checkAndInitialize();
  }
  /**
   * Apply all routes for university
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    // NOTE: All routes work
    router
      .get("/", this.getUniversities)
      // .get("/initialize", this.initializeUniversity) // TODO: delete this
      .post("/", this.postUniverity)
      .patch("/:id", this.updateUniversity)
      .delete("/:universityId", this.deleteUniversity);

    return router;
  }

  /**
   * Sends a message containing all universities back as a response
   * @param req
   * @param res
   */
  getUniversities = async (req: Request, res: Response) => {
    this.logger.debug("getUniversities request");
    const allUniversities = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allUniversities);
  };

  /**
   * Creates a new university
   * @param req
   * @param res
   */
  postUniverity = async (req: Request, res: Response) => {
    this.logger.debug("postUniverity request");
    const uni = await this.create(req, res);
    return res.status(StatusCodes.OK).json({ university: uni._id });
  };

  /**
   * Delete university by id
   * @param req
   * @param res
   */
  deleteUniversity = async (req: Request, res: Response) => {
    this.logger.debug("deleteUniversity request");
    const university = await this.delete(req.params.universityId, req, res);
    return res.status(StatusCodes.OK).json(university);
  };

  /**
   * Update university by id
   * @param req
   * @param res
   */
  updateUniversity = async (req: Request, res: Response) => {
    this.logger.debug("updateUniversity request");
    const uni = await this.update(req.params.id, req.body.blacklist, req, res);
    return res.status(StatusCodes.OK).json(uni);
  };

  /**
   * Initialize items
   * @param req
   * @param res
   */
  initializeUniversity = async (req: Request, res: Response) => {
    this.logger.debug("initializeUniversity request");

    const universitiesToInsert: University_t[] = [
      { name: "University of Crete", country: "Greece" },
    ];

    await UniversityModel.insertMany(universitiesToInsert)
      .then((docs) => {
        res.json(docs);
      })
      .catch(() => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      });
  };

  initializeUniversities = async () => { 
    this.logger.debug("initializeUniversities request");

    const universitiesToInsert: University_t[] = [
      { name: "University of Crete", country: "Greece" },
    ];

    await UniversityModel.insertMany(universitiesToInsert)
      .then(() => {
        this.logger.success("Universities initialized successfully!");
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  /**
   * Initialize universities if database is empty
   * @returns Promise<void>
   */
  private async checkAndInitialize(): Promise<void> {
    try {
      const data = await UniversityModel.findOne({})
      if(!data){
        this.initializeUniversities();
      }
    }catch(error){
      this.logger.error("Error ocurred in university initialization: ", error);
    }
  }
}
