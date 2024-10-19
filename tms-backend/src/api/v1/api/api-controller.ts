import { NextFunction, Request, Response, Router } from "express";
import { IApi, ApiModel } from "./api-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import fs from "fs";
import { UserModel } from "../users/user-model";
import { Document, Model } from "mongoose";
import { FavouritesModel } from "../favourites/favourites-model";
import { AreaModel } from "../area/area-model";

// Define a custom interface to ensure req has a results property
interface CustomResponse extends Response {
  results?: {
    auth?: string;
    email?: string;
    role?: string;
    group?: string;
    message?: string;
  };
  paginatedData?: {
    results?: {};
    next?: any;
    previous?: any;
    startIndex?: number;
    endIndex?: number;
    total?: number;
  };
}

export class ApiController extends ResourceController<IApi> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(ApiModel);
  }
  /**
   * Apply all routes for api
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/uploads", this.verifyJWT)
      .get("/downloads/:folderName/:fileName", this.sendFile)
      .get("/users/professors", this.getAllProfessors)
      .get("/users/admins", this.getAllAdmins)
      .get("/users/secretariats", this.getAllSecretariats)
      .get("/users/:userId", this.getUserById)
      .get("/favourites/:userId", this.getFavouriteUser)
      .get("/thesis/areas", this.getAreas)
      .get("/users", this.paginatedData(UserModel), this.getAllUsers);

    return router;
  }

  /**
   * Sends file that was requested
   *
   * @param req
   * @param res
   */
  sendFile = async (req: Request, res: Response) => {
    this.logger.debug("sendFile request");
    try {
      const folder = req.params.folderName;
      const file = req.params.fileName;

      if (
        !(
          folder === "theses" ||
          folder === "requests" ||
          folder === "reports" ||
          folder === "chat"
        )
      ) {
        res.status(401).send({ message: "Folder doesn't exist!" });
      }

      const filepath = "./public/uploads/" + folder + "/" + file;
      var options = {
        root: "./public/uploads/" + folder + "/",
      };

      res.sendFile(file, options, (err: any, ...data: any) => {
        if (err) console.log(err);
        else this.logger.log("Sent: ", file);
      });
    } catch (err) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Server internal error occurred!" });
    }
  };

  /**
   * Request all users in database
   * @param req
   * @param res
   */
  getAllUsers = async (req: Request, res: CustomResponse) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server internal error occurred!" });
    }
  };

  /**
   * HTTP Request to verify JWT token
   * @param req
   * @param res
   */
  verifyJWT = async (req: Request, res: Response) => {
    this.logger.debug("verifyJWT request");
    try {
      // console.log(`${__dirname}`);
      let directory = "./public/uploads/";
      const filenames = fs.readdirSync(directory);

      if (filenames.length == 0) {
        this.logger.error("\nNo files in directory!");
      } else {
        this.logger.log("\nCurrent directory filenames:");
        filenames.forEach((file) => {
          this.logger.log(file);
        });
      }

      return res.status(StatusCodes.OK).send(filenames);
    } catch (err) {
      this.logger.error("" + err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Server internal error occurred!" });
    }
  };

  /**
   * Request all professors in database
   * @param req
   * @param res
   */
  getAllProfessors = async (req: Request, res: Response) => {
    this.logger.debug("getAllProfessors request");
    const users_data = await UserModel.find({ role: "professor" })
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Request all admins in database
   * @param req
   * @param res
   */
  getAllAdmins = async (req: Request, res: Response) => {
    await UserModel.find({ role: "administrator" })
      .then((data) => {
        return res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Request all secretariats in database
   * @param req
   * @param res
   */
  getAllSecretariats = async (req: Request, res: Response) => {
    await UserModel.find({ role: "secretariat" })
      .then((data) => {
        return res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Request user by id
   * @param req
   * @param res
   */
  getUserById = async (req: Request, res: Response) => {
    const user = this.getOne(req.params.userId, req, res);
    return res.status(StatusCodes.OK).json(user);
  };

  /**
   * Request all universities
   * @param req
   * @param res
   */
  getAllUniversities = async (req: Request, res: Response) => {};

  /**
   * Request specific user (with id) in database
   * @param req
   * @param res
   */
  getFavouriteUser = async (req: Request, res: Response) => {
    await FavouritesModel.find({ student: req.params.userId })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred: " + err);
      });
  };

  /**
   * Request areas for thesis dropdown
   * @param req
   * @param res
   */
  getAreas = async (req: Request, res: Response) => {
    await AreaModel.find({})
      .then((data) => {
        let areas = data.map((area) => {
          return {
            _id: area._id,
            name: area.name,
          };
        });

        // console.log(areas);
        areas.sort((a, b) => {
          let result = 0;
          if (a.name && b.name)
            result = a.name.localeCompare(b.name, "en", {
              sensitivity: "base",
            });
          return result;
        });
        res.json(areas);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred: " + err);
      });
  };

  private paginatedData<T extends Document>(model: Model<T>) {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const attr: any = req.query.attr;
      const filter: any = req.query.filter;
      let results: {
        results?: {};
        next?: any;
        previous?: any;
        startIndex?: number;
        endIndex?: number;
        total?: number;
      } = {};

      if (page <= 0 || limit <= 0) {
        results.results = {};
        res.paginatedData = results;
        next();
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      results = {};

      let filtered_data;
      if (attr && filter) {
        filtered_data = await model.find({ [attr]: filter });

        if (filtered_data) {
          // console.log(filtered_data)
          results.startIndex = startIndex;
          results.endIndex = endIndex;
          results.total = filtered_data.length;

          if (endIndex < (await filtered_data.length)) {
            results.next = {
              page: page + 1,
              limit: limit,
            };
          }

          if (startIndex > 0) {
            results.previous = {
              page: page - 1,
              limit: limit,
            };
          }

          filtered_data.sort((a: any, b: any) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

          try {
            results.results = await filtered_data.slice(startIndex, endIndex);
            //console.log(results);
            res.paginatedData = results;
            next();
          } catch (err: any) {
            res.status(500).json({ message: err.message });
          }
        }
      } else {
        try {
          results.results = await model
            .find()
            .limit(limit)
            .skip(startIndex)
            .exec();

          // console.log(results);
          await model.countDocuments({}, function (err: any, count: any) {
            // console.log("Number of items:", count);
            results.startIndex = startIndex;
            results.endIndex = endIndex;
            results.total = count;

            res.paginatedData = results;
            next();
          });
        } catch (err: any) {
          res.status(500).json({ message: err.message });
        }
      }
    };
  }
}
