import { Request, Response, Router } from "express";
import { IFavourites, FavouritesModel, Favourites_t } from "./favourites-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class FavouritesController extends ResourceController<IFavourites> {
  private logger: Logger = new Logger();
  constructor() {
    super(FavouritesModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get('/', this.getFavourites)
      .get("/:area", this.getFavouritesByArea)
      .post("/", this.postFavourite)
      .delete("/", this.deleteFavourite);

    return router;
  }
  
  /**
   * Sends a message containing all favourites back as a response
   * @param req
   * @param res
   */
  getFavourites = async (req: Request, res: Response) => {
    this.logger.debug('getFavourites request');
    // you can pre-process the request here before passing it to the super class method
    const allAreas = await this.getAll(req, res);
    // you can process the data retrieved here before returning it to the client
    return res
      .status(StatusCodes.OK)
      .json(allAreas);
  }

  /**
   * Get all favourites of an area
   * @param req
   * @param res
   */
  getFavouritesByArea = async (req: Request, res: Response) => {
    this.logger.debug("getFavouriteByArea request");
    await FavouritesModel.find({ area_name: req.params.area })
      .then((data) => {
        return res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        this.logger.error("" + StatusCodes.INTERNAL_SERVER_ERROR);
      });
  };

  /**
   * Creates a new favourite and responds with the unique id of the created instance
   * @param req
   * @param res
   */
  postFavourite = async (req: Request, res: Response) => {
    this.logger.debug("postFavourite request");
    const favourite = await this.create(req, res);
    return res.status(StatusCodes.OK).json({ favourite: favourite._id });
  };

  /**
   * Delete task by id
   * @param req
   * @param res
   */
  deleteFavourite = async (req: Request, res: Response) => {
    this.logger.debug("deleteFavourite request");
    const find_favourite = await FavouritesModel.findOne({
      student: req.query.student,
      area_id: req.query.area_id,
    })
      .then((data) => {
        const removed_favourite = FavouritesModel.deleteOne({ _id: data!._id })
          .then((data: any) => {
            res.json(data);
          })
          .catch((err: any) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
          });
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
      });
  };
}
