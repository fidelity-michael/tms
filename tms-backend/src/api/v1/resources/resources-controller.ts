// TODO: Change this file. It's saved to remember the general structure
import { Request, Response, NextFunction, Router } from 'express';
import { IResource, ResourceModel } from './resources-model';
import { ResourceController } from '../../shared';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/utils/logger';
export class ResourcesController extends ResourceController<IResource>{
  private logger: Logger = new Logger();
  constructor() {
    super(ResourceModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get('/', this.getResources)
      .get('/initialize', this.initializeResources)
      .get('/:id', this.getResourceById)
      .post('/', this.postResource)
      .put('/:id', this.updateResource)
      .delete('/:id', this.deleteResource);

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
  getResources = async (req: Request, res: Response) => {
    this.logger.debug('getResources request');
    // you can pre-process the request here before passing it to the super class method
    const allResources = await this.getAll(req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(allResources);
  }

  /**
   * Creates a new task
   * @param req
   * @param res
   */
  postResource = async (req: Request, res: Response) => {
    this.logger.debug('postResource request');
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
  deleteResource = async (req: Request, res: Response) => {
    this.logger.debug('deleteResource request');
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
  updateResource = async (req: Request, res: Response) => {
    this.logger.debug('updateResource request');
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
  getResourceById = async (req: Request, res: Response) => {
    this.logger.debug('getResourceById request');
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
  initializeResources = async (req: Request, res: Response) => {
    this.logger.debug('initialize events request');
    }
}
