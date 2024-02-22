
import { Request, Response, NextFunction, Router } from 'express';
import { IArea, AreaModel } from './area-model';
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
    const task = await this.delete(req.params.id, req, res);
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
    const task = await this.update(req.params.id, req.body.blacklist, req, res);
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
    this.logger.debug('initialize area request');
    }
}
