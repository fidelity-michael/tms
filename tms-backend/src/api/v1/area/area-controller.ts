import { Request, Response, Router } from "express";
import { IArea, AreaModel, Area_t } from "./area-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class AreaController extends ResourceController<IArea> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(AreaModel);
    this.checkAndInitialize();
  }
  /**
   * Apply all routes for area
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getArea)
      // .get("/initialize", this.initializeArea)
      .get("/:id", this.getAreaById)
      .post("/", this.postArea)
      .patch("/:areaId", this.updateArea)
      .delete("/all", this.deleteAll)
      .delete("/:areaId", this.deleteArea);

    return router;
  }

  /**
   * Sends a message containing all areas back as a response
   * @param req
   * @param res
   */
  getArea = async (req: Request, res: Response) => {
    this.logger.debug("getArea request");
    // you can pre-process the request here before passing it to the super class method
    const allAreas = await this.getAll(req, res);
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(allAreas);
  };

  /**
   * Creates a new area
   * @param req
   * @param res
   */
  postArea = async (req: Request, res: Response) => {
    this.logger.debug("postArea request");
    // Create a new Area
    try {
      let area = null;

      if (req.body.description.length > 0) {
        area = new AreaModel({
          name: req.body.area_name,
          description: req.body.description,
        });
      } else {
        area = new AreaModel({
          name: req.body.area_name,
          description: "No Description",
        });
      }

      const saved_area = await area.save();
      res.status(StatusCodes.OK).send({ area: area._id });
    } catch (err) {
      res.status(400).send(err);
    }
  };

  /**
   * Delete area by id
   * @param req
   * @param res
   */
  deleteArea = async (req: Request, res: Response) => {
    this.logger.debug("deleteArea request");
    const area = await this.delete(req.params.areaId, req, res);
    return res.status(StatusCodes.OK).json(area);
  };

  /**
   * Delete all areas
   * @param req
   * @param res
   */
  deleteAll = async (req: Request, res: Response) => {
    this.logger.debug("deleteAll request");
    const allAreas = await this.getAll(req, res);
    if (allAreas) {
      for (const item of allAreas) {
        await this.delete(item._id.toString(), req, res);
      }
      this.logger.success("All area items deleted");
    }
  };

  /**
   * Update area by id
   * @param req
   * @param res
   */
  updateArea = async (req: Request, res: Response) => {
    this.logger.debug("updateArea request");
    const updated_area = await AreaModel.updateOne(
      { _id: req.params.areaId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data: any) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch((err: any) => {
        this.logger.error("Server internal error occurred!");
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
      });
  };

  /**
   * Get single area by id
   * @param req
   * @param res
   */
  getAreaById = async (req: Request, res: Response) => {
    this.logger.debug("getAreaById request");
    const area = await this.getOne(req.params.id, req, res);
    return res.status(StatusCodes.OK).json(area);
  };

  /**
   * Initialize areas if the databaseis empty
   */
  private async checkAndInitialize() {
    const area_data = await AreaModel.findOne({});
    try {
      if (!area_data) {
        this.initAreas();
      }
    } catch (err) {
      this.logger.error("Error ocurred in area initialization: ", err);
    }
  }

  initAreas = async () => {
    const areaToInsert: Area_t[] = [
      {
        name: "Computer architecture and microelectronics",
        description: "No Description",
        image: "",
      },
      {
        name: "Computer systems, parallel and high performance computing",
        description: "No Description",
        image: "",
      },
      {
        name: "Computer security and distributed systems",
        description: "No Description",
        image: "",
      },
      {
        name: "Computer networks, mobile computing, and telecommunications",
        description: "No Description",
        image: "",
      },
      {
        name: "Algorithms and systems analysis",
        description: "No Description",
        image: "",
      },
      {
        name: "Databases, information and knowledge management",
        description: "No Description",
        image: "",
      },
      {
        name: "Software engineering and programming languages",
        description: "No Description",
        image: "",
      },
      {
        name: "Artificial Intelligence and machine learning",
        description: "No Description",
        image: "",
      },
      {
        name: "Signal processing and analysis",
        description: "No Description",
        image: "",
      },
      {
        name: "Computer vision and robotics",
        description: "No Description",
        image: "",
      },
      {
        name: "Computer graphics and human-computer interaction",
        description: "No Description",
        image: "",
      },
      {
        name: "Βioinformatics, medical informatics, and computational neuroscience",
        description: "No Description",
        image: "",
      },
    ];

    await AreaModel.insertMany(areaToInsert)
      .then((docs) => {
        this.logger.success("Areas initialized successfully!");
      })
      .catch((err: any) => {
        this.logger.error(err);
      });
  };

  /**
   * Initialize items
   * @param req
   * @param res
   */
  initializeArea = async (req: Request, res: Response) => {
    this.logger.debug("Initialize area request");

    const areaToInsert: Area_t[] = [
      { name: "Computer Hardware", description: "No Description", image: "" },
      { name: "Computer Networking", description: "No Description", image: "" },
      { name: "Computer Software", description: "No Description", image: "" },
      { name: "Cloud computing", description: "No Description", image: "" },
      {
        name: "Cyber Security and Ethical Hacking",
        description: "No Description",
        image: "",
      },
      {
        name: "Data Science and Data Analysis",
        description: "No Description",
        image: "",
      },
      {
        name: "Programming Language",
        description: "No Description",
        image: "",
      },
      { name: "Micro Architecture", description: "No Description", image: "" },
      { name: "Operating system", description: "No Description", image: "" },
      { name: "Web Development", description: "No Description", image: "" },
      { name: "Web Designing", description: "No Description", image: "" },
      { name: "Graphics design", description: "No Description", image: "" },
      {
        name: "Network Analytics and testing",
        description: "No Description",
        image: "",
      },
      { name: "Robotics", description: "No Description", image: "" },
      {
        name: "Artificial intelligence",
        description: "No Description",
        image: "",
      },
      {
        name: "Computer Aided Design drafter",
        description: "No Description",
        image: "",
      },
      { name: "Data Entry Operator", description: "No Description", image: "" },
      {
        name: "DataBase management system",
        description: "No Description",
        image: "",
      },
      { name: "Video Game Designer", description: "No Description", image: "" },
      {
        name: "Computer Architecture and Engineering",
        description: "No Description",
        image: "",
      },
      { name: "UI designer", description: "No Description", image: "" },
      {
        name: "Computer Animation and 3D design",
        description: "No Description",
        image: "",
      },
      { name: "Computer vfx", description: "No Description", image: "" },
      {
        name: "Motion graphics and Visual Effects",
        description: "No Description",
        image: "",
      },
      { name: "Computer Biosystem", description: "No Description", image: "" },
      { name: "Numeric analysis", description: "No Description", image: "" },
      { name: "Cryptography", description: "No Description", image: "" },
      {
        name: "Research and development",
        description: "No Description",
        image: "",
      },
      {
        name: "Traffic control system",
        description: "No Description",
        image: "",
      },
      {
        name: "Mobile Application Development",
        description: "No Description",
        image: "",
      },
      { name: "Computer Accounting", description: "No Description", image: "" },
      {
        name: "User Experience design",
        description: "No Description",
        image: "",
      },
      { name: "SEO", description: "No Description", image: "" },
      { name: "Digital Marketing", description: "No Description", image: "" },
      { name: "Business Management", description: "No Description", image: "" },
      {
        name: "Stenographer and typist",
        description: "No Description",
        image: "",
      },
      {
        name: "Clinical image processing",
        description: "No Description",
        image: "",
      },
      {
        name: "Medical Record Technology",
        description: "No Description",
        image: "",
      },
      {
        name: "Video editing and compositing",
        description: "No Description",
        image: "",
      },
    ];

    await AreaModel.insertMany(areaToInsert)
      .then((docs) => {
        res.json(docs);
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      });
  };
}
