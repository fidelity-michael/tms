import { Request, Response, Router } from 'express';
import { IArea, AreaModel, Area_t } from './area-model';
import { ResourceController } from '../../shared';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/utils/logger';

export class AreaController extends ResourceController<IArea>{
  private logger: Logger = new Logger();
  constructor() {
    super(AreaModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get('/', this.getArea)
      .get('/initialize', this.initializeArea)
      .get('/:id', this.getAreaById)
      .post('/', this.postArea)
      .put('/:id', this.updateArea)
      .delete('/:id', this.deleteArea);

    return router;
  }

  /**
   * In all of the methods below, we are using the super class methods to perform the CRUD operations.
   * Request and Response are passed to the super class methods so that they can be extracted and used.
   * In case you need to do any preprocessing (e.g., filter a body's field) you can do it before calling the super class methods.
   */
  /**
   * Sends a message containing all tasks back as a response
   * @param req
   * @param res
   */
  getArea = async (req: Request, res: Response) => {
    this.logger.debug('getArea request');
    // you can pre-process the request here before passing it to the super class method
    const allAreas = await this.getAll(req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(allAreas);
  }

  /**
   * Creates a new task
   * @param req
   * @param res
   */
  postArea = async (req: Request, res: Response) => {
    this.logger.debug('postArea request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.create(req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Delete task by id
   * @param req
   * @param res
   */
  deleteArea = async (req: Request, res: Response) => {
    this.logger.debug('deleteArea request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.delete(req.params.id, req, res); // WARN: maybe areaId
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Update task by id
   * @param req
   * @param res
   */
  updateArea = async (req: Request, res: Response) => {
    this.logger.debug('updateArea request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.update(req.params.id, req.body.blacklist, req, res); // WARN: check for correct params
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Get single task by id
   * @param req
   * @param res
   */
  getAreaById = async (req: Request, res: Response) => {
    this.logger.debug('getAreaById request');
    // you can pre-process the request here before passing it to the super class method
    const task = await this.getOne(req.params.id, req, res);

    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(task);
  }

  /**
   * Initialize items
   * @param req
   * @param res
   */
  initializeArea = async (req: Request, res: Response) => {
    this.logger.debug('Initialize area request');

    const areaToInsert: Area_t[] = [
      { name: "Computer Hardware",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Networking",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Software",
        description: "No Description",
        image: "" 
      },
      { name: "Cloud computing",
        description: "No Description",
        image: "" 
      },
      { name: "Cyber Security and Ethical Hacking",
        description: "No Description",
        image: "" 
      },
      { name: "Data Science and Data Analysis",
        description: "No Description",
        image: "" 
      },
      { name: "Programming Language",
        description: "No Description",
        image: "" 
      },
      { name: "Micro Architecture",
        description: "No Description",
        image: "" 
      },
      { name: "Operating system",
        description: "No Description",
        image: "" 
      },
      { name: "Web Development",
        description: "No Description",
        image: "" 
      },
      { name: "Web Designing",
        description: "No Description",
        image: "" 
      },
      { name: "Graphics design",
        description: "No Description",
        image: "" 
      },
      { name: "Network Analytics and testing",
        description: "No Description",
        image: "" 
      },
      { name: "Robotics",
        description: "No Description",
        image: "" 
      },
      { name: "Artificial intelligence",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Aided Design drafter",
        description: "No Description",
        image: "" 
      },
      { name: "Data Entry Operator",
        description: "No Description",
        image: "" 
      },
      { name: "DataBase management system",
        description: "No Description",
        image: "" 
      },
      { name: "Video Game Designer",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Architecture and Engineering",
        description: "No Description",
        image: "" 
      },
      { name: "UI designer",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Animation and 3D design",
        description: "No Description",
        image: "" 
      },
      { name: "Computer vfx",
        description: "No Description",
        image: "" 
      },
      { name: "Motion graphics and Visual Effects",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Biosystem",
        description: "No Description",
        image: "" 
      },
      { name: "Numeric analysis",
        description: "No Description",
        image: "" 
      },
      { name: "Cryptography",
        description: "No Description",
        image: "" 
      },
      { name: "Research and development",
        description: "No Description",
        image: "" 
      },
      { name: "Traffic control system",
        description: "No Description",
        image: "" 
      },
      { name: "Mobile Application Development",
        description: "No Description",
        image: "" 
      },
      { name: "Computer Accounting",
        description: "No Description",
        image: "" 
      },
      { name: "User Experience design",
        description: "No Description",
        image: "" 
      },
      { name: "SEO",
        description: "No Description",
        image: "" 
      },
      { name: "Digital Marketing",
        description: "No Description",
        image: "" 
      },
      { name: "Business Management",
        description: "No Description",
        image: "" 
      },
      { name: "Stenographer and typist",
        description: "No Description",
        image: "" 
      },
      { name: "Clinical image processing",
        description: "No Description",
        image: "" 
      },
      { name: "Medical Record Technology",
        description: "No Description",
        image: "" 
      },
      { name: "Video editing and compositing",
        description: "No Description",
        image: "" 
      }
    ];

    await AreaModel.insertMany(areaToInsert)
      .then((docs) => {
        res.json(docs);
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
      })

  }
}
