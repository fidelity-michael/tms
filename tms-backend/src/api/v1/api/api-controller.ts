import { NextFunction, Request, Response, Router } from "express";
import { IApi, ApiModel } from "./api-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import fs from "fs";
import { IUser, UserModel } from "../users/user-model";
import { Document, Model } from "mongoose";
import { FavouritesModel } from "../favourites/favourites-model";
import { AreaModel } from "../area/area-model";
import { UniversityModel } from "../universities/university-model";
import { DepartmentModel } from "../departments/departments-model";
import { Thesis_t, ThesisModel } from "../theses/theses-model";
import { ThesesReqModel } from "../theses_requests/theses-model";
import { AssignedThesisModel } from "../assigned_theses/assigned-thesis-model";
import { ThesesRepModel } from "../theses_reports/theses_rep-model";
import path from "path";

type PaginatedData = {
  results?: {} | [];
  next?: any;
  previous?: any;
  startIndex?: number;
  endIndex?: number;
  total?: number;
};

type Data = {
  thesis?: Thesis_t;
  status?: string;
  professor?: string;
  supervisor?: string[];
  date?: Date;
};

// Define a custom interface to ensure req has a results property
interface CustomResponse extends Response {
  results?: {
    auth?: string;
    email?: string;
    role?: string;
    group?: string;
    message?: string;
  };
  paginatedData?: PaginatedData;
  data?: Data;
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
    // WARN: Not complete yet
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
      .get("/users", this.paginatedData(UserModel), this.getAllUsers)
      .get(
        "/universities",
        this.paginatedData(UniversityModel),
        this.getAllUniversities,
      )
      .get(
        "/departments",
        this.paginatedData(DepartmentModel),
        this.getAllDepartments,
      )
      .get("/areas", this.paginatedData(AreaModel), this.getAllAreas)
      .get(
        "/theses",
        this.paginatedData(ThesisModel),
        this.convertThesesData(),
        this.getAllTheses,
      )
      .get(
        "/theses/:userId",
        this.paginatedFilteredData(ThesisModel),
        this.convertThesesData(),
        this.getAllTheses,
      )
      .get(
        "/theses_requests",
        this.paginatedData(ThesesReqModel),
        this.getAllTheses,
      )
      .get(
        "/theses_requests/:userId",
        this.paginatedFilteredData(ThesesReqModel),
        this.convertRequestsData(),
        this.getAllTheses,
      )
      .get(
        "/assigned_theses",
        this.paginatedData(AssignedThesisModel),
        this.convertAssignedThesissData(),
        this.getAllTheses,
      )
      .get(
        "/assigned_theses/:userId",
        this.paginatedFilteredData(AssignedThesisModel),
        this.convertAssignedThesissData(),
        this.getAllAssignedTheses,
      )
      .get("/my_thesis/:userId", this.convertThesissData(), this.getUsersThesis)
      .get(
        "/reports/:userId",
        this.paginatedFilteredData(ThesesRepModel),
        this.getAllTheses,
      )
      .post("/uploads/:folderName", this.uploadFile);

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
        res
          .status(StatusCodes.NOT_FOUND)
          .send({ message: "Folder doesn't exist!" });
      }

      const filepath = "./public/uploads/" + folder + "/" + file;
      var options = {
        root: "./public/uploads/" + folder + "/",
      };

      res.sendFile(file, options, (err: any, ...data: any) => {
        if (err) this.logger.error(err);
        else this.logger.debug("Sent: ", file);
      });
    } catch (err: any) {
      this.logger.error(err);
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
    } catch (err: any) {
      this.logger.error(err);
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
  getAllUniversities = async (req: Request, res: CustomResponse) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server internal error occurred!" });
    }
  };

  /**
   * Request all departments in database
   * @param req
   * @param res
   */
  getAllDepartments = async (req: Request, res: CustomResponse) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server internal error occurred!" });
    }
  };

  /**
   * Request all areas in database
   * @param req
   * @param res
   */
  getAllAreas = async (req: Request, res: CustomResponse) => {
    this.logger.debug("getAllAreas request");
    this.returnResults(req, res);
  };

  /**
   * Request all theses in database
   * @param req
   * @param res
   */
  getAllTheses = async (req: Request, res: CustomResponse) => {
    this.logger.debug("getAllTheses request");
    this.returnResults(req, res);
  };

  /**
   * Request User's assigned theses in database
   * @param req
   * @param res
   */
  getAllAssignedTheses = async (req: Request, res: CustomResponse) => {
    this.logger.debug("getAllAssignedTheses request");
    this.returnResults(req, res);
  };

  /**
   * Request User's thesis
   * @param req
   * @param res
   */
  getUsersThesis = async (req: Request, res: CustomResponse) => {
    this.logger.debug("getUsersThesis request");
    try {
      res.json(res.data);
    } catch (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server internal error occurred!" });
    }
  };

  /**
   * Return the results obtained by paginatedData() equivelant functions
   * @param req
   * @param res
   * @returns object of type PaginatedData
   */
  private async returnResults(req: Request, res: CustomResponse) {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server internal error occurred!" });
    }
  }

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
      .catch((err: any) => {
        this.logger.error("Server internal error occurred: " + err);
      });
  };

  /**
   * Upload file
   * @param req
   * @param res
   */
  uploadFile = async (req: Request, res: Response) => {
    try {
      const folder = req.params.folderName;
      const files = req.files!.files;

      let newFilenames = [];

      if (
        !(
          folder === "theses" ||
          folder === "requests" ||
          folder === "reports" ||
          folder === "chat"
        )
      ) {
        res
          .status(StatusCodes.NOT_FOUND)
          .send({ message: "Folder doesn't exist!" });
      }

      // console.log(files);
      if (files instanceof Array) {
        Promise.all(
          files.map((file, index) => {
            let filename = file.name;
            let ext = path.extname(filename);
            let name = path.basename(filename, ext);
            let filename_timestamp =
              name + "_" + new Date().getTime().toString() + ext;

            newFilenames.push(filename_timestamp);

            let directory = "./public/uploads";
            file.mv(`${directory}/${folder}/${filename_timestamp}`, (err) => {
              if (err) {
                console.log(err);
                return res
                  .status(500)
                  .send({ message: "Server internal error occurred!" });
              } else {
                this.logger.debug("Modified Names: " + filename_timestamp);
                // console.log(`File Path: ./public/uploads/${folder}/${filename_timestamp}`);
              }
            });

            return index;
          }),
        );
      } else {
        let filename = files.name;
        let ext = path.extname(filename);
        let name = path.basename(filename, ext);
        let filename_timestamp =
          name + "_" + new Date().getTime().toString() + ext;

        newFilenames.push(filename_timestamp);

        let directory = "./public/uploads";
        files.mv(`${directory}/${folder}/${filename_timestamp}`, (err) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .send({ message: "Server internal error occurred!" });
          } else {
            console.log("Modified Name: ", filename_timestamp);
            // console.log(`File Path: ./public/uploads/${folder}/${filename_timestamp}`);
          }
        });
      }

      // console.log("Files uploaded successfully!");
      // console.log("Filenames: ", newFilenames);
      res.send({
        files_list: newFilenames,
        message: "Files uploaded!",
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  };

  /**
   *
   * #region private Functions
   *
   */

  /**
   * @returns PaginatedData
   */
  private paginatedData<T extends Document>(model: Model<T>) {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const attr: any = req.query.attr;
      const filter: any = req.query.filter;
      let results: PaginatedData = {};

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
            res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ message: err.message });
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
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: err.message });
        }
      }
    };
  }

  private convertThesesData() {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      try {
        let converted_data = [];

        if (
          Array.isArray(res.paginatedData!.results) &&
          res.paginatedData!.results
        ) {
          let index = 0;
          while (res.paginatedData!.results[index]) {
            const professor = await UserModel.findById(
              res.paginatedData!.results[index].professor,
              "email first_name last_name",
            );

            if (professor) {
              let newObject = {
                _id: res.paginatedData!.results[index]._id,
                date: res.paginatedData!.results[index].date,
                title: res.paginatedData!.results[index].title,
                topic: res.paginatedData!.results[index].topic,
                area: res.paginatedData!.results[index].area,
                description: res.paginatedData!.results[index].description,
                prerequisites: res.paginatedData!.results[index].prerequisites,
                group: res.paginatedData!.results[index].group,
                status: res.paginatedData!.results[index].status,
                required_files:
                  res.paginatedData!.results[index].required_files,
                thesis_files: res.paginatedData!.results[index].thesis_files,
                professor_id: professor._id,
                professor_email: professor.email,
                professor_name:
                  professor.first_name + " " + professor.last_name,
              };

              converted_data.push(newObject);
            }

            index++;
          }

          // console.log("Current Data : ", res.paginatedData.results);
          // console.log("Converted Data : ", converted_data);
          res.paginatedData!.results = converted_data;
        }

        next();
      } catch (err: any) {
        this.logger.error(err);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Server internal error occurred!" });
      }
    };
  }

  private paginatedFilteredData<T extends Document>(model: Model<T>) {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);

      const user: any = req.query.user;
      const userId: any = req.params.userId;

      const attr: any = req.query.attr;
      const filter: any = req.query.filter;

      if (page <= 0 || limit <= 0) {
        const results: PaginatedData = {};
        results.results = {};
        res.paginatedData = results;
        next();
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results: PaginatedData = {};

      let filtered_data;
      if (!userId) {
        filtered_data = await model.find({ [attr]: filter });
      } else if (userId && filter === "none") {
        // console.log("UserId: ", userId);
        filtered_data = await model.find({ [user]: userId });
      } else {
        try {
          const temp_data: any = await model.find({ [user]: userId });
          filtered_data = temp_data.filter((obj: any) => obj[attr] === filter);
        } catch (err: any) {
          this.logger.error(err);
        }
      }

      if (filtered_data) {
        // console.log(filtered_data)
        results.startIndex = startIndex;
        results.endIndex = endIndex;
        results.total = filtered_data.length;

        if (endIndex < filtered_data.length) {
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
      }

      filtered_data?.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      try {
        results.results = await filtered_data.slice(startIndex, endIndex);
        //console.log(results);
        res.paginatedData = results;
        next();
      } catch (err: any) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: err.message });
      }
    };
  }

  private convertRequestsData() {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      try {
        let converted_data = [];

        if (
          Array.isArray(res.paginatedData!.results) &&
          res.paginatedData!.results
        ) {
          let index = 0;
          while (res.paginatedData!.results[index]) {
            const thesis = await ThesisModel.findById(
              res.paginatedData!.results[index].thesis,
              "title topic area group",
            );
            const student = await UserModel.findById(
              res.paginatedData!.results[index].student,
              "email first_name last_name",
            );
            const professor = await UserModel.findById(
              res.paginatedData!.results[index].professor,
              "email first_name last_name",
            );

            if (thesis && student && professor) {
              let newObject = {
                _id: res.paginatedData!.results[index]._id,
                date: res.paginatedData!.results[index].date,
                thesis_id: thesis._id,
                thesis_title: thesis.title,
                thesis_topic: thesis.topic,
                thesis_area: thesis.area,
                thesis_group: thesis.group,
                student_id: student._id,
                student_email: student.email,
                student_name: student.first_name + " " + student.last_name,
                required_files:
                  res.paginatedData!.results[index].required_files,
                professor_id: professor._id,
                professor_email: professor.email,
                professor_name:
                  professor.first_name + " " + professor.last_name,
              };

              converted_data.push(newObject);
            }

            index++;
          }

          // console.log("Current Data : ", res.paginatedData.results);
          // console.log("Converted Data : ", converted_data);
          res.paginatedData!.results = converted_data;
        }

        next();
      } catch (err: any) {
        this.logger.error(err);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Server internal error occurred!" });
      }
    };
  }

  /**
   * Get as input (from response) the GET request data for assignedTheses and converts them
   */
  private convertAssignedThesissData() {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      try {
        let converted_data = [];

        // console.log(res.paginatedData.results)
        if (
          Array.isArray(res.paginatedData!.results) &&
          res.paginatedData!.results
        ) {
          let index = 0;
          while (res.paginatedData!.results[index]) {
            const thesis = await ThesisModel.findById(
              res.paginatedData!.results[index].thesis,
              "title topic area group",
            );
            const student = await UserModel.findById(
              res.paginatedData!.results[index].student,
              "email first_name last_name",
            );
            const professor = await UserModel.findById(
              res.paginatedData!.results[index].professor,
              "email first_name last_name",
            );

            /*
          const supervisor = await User.findById(
            res.paginatedData.results[index].supervisor,
            "email first_name last_name"
          );*/

            var supervisor: (IUser | null)[] = [];
            var newSupervisor;
            for (const sup in res.paginatedData!.results[index].supervisor) {
              newSupervisor = await UserModel.findById(
                res.paginatedData!.results[index].supervisor[sup],
                "email first_name last_name",
              );

              supervisor.push(newSupervisor);
            }

            let newObject = {
              _id: res.paginatedData!.results[index]._id,
              date: res.paginatedData!.results[index].date,
              thesis_title: thesis!.title,
              thesis_topic: thesis!.topic,
              thesis_area: thesis!.area,
              thesis_group: thesis!.group,
              thesis_status: res.paginatedData!.results[index].status,
              thesis_title_greek: res.paginatedData!.results[index].title_greek,
              thesis_title_english:
                res.paginatedData!.results[index].title_english,
              thesis_grade: res.paginatedData!.results[index].grade,
              student_id: student!._id,
              student_email: student!.email,
              student_name: student!.first_name + " " + student!.last_name,
              professor_email: professor!.email,
              professor_name:
                professor!.first_name + " " + professor!.last_name,
              supervisor_email: supervisor.map((element) =>
                element ? element.email : null,
              ),
              // supervisor_name: supervisor.map((supe) => { // NOTE: This returns all supervisors names
              //   supe ? supe.first_name + " " + supe.last_name : null;
              // }),
              supervisor_name:
                supervisor[0]!.first_name + " " + supervisor[0]!.last_name, // WARN: Check this
              supervisor_id: supervisor.map((element) =>
                element ? element.id : null,
              ),
            };

            //newObject.supervisor_id = supervisor.map(element => element.id)
            //console.log('oi supervisors:', newObject.supervisor_id)

            // console.log(newObject);
            converted_data.push(newObject);
            index++;
          }
          res.paginatedData!.results = converted_data;
        }

        next();
      } catch (err) {
        console.log(err);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Server internal error occurred!" });
      }
    };
  }

  private convertThesissData() {
    return async (req: Request, res: CustomResponse, next: NextFunction) => {
      try {
        type converted_data_t = {
          date?: Date;
          thesis?: Thesis_t;
          status?: string;
          professor?: string;
          supervisor?: string[];
        };
        let converted_data: Data = {};
        //we get the theisis id
        const thesis_assigned = await AssignedThesisModel.find({
          student: req.params.userId,
        });

        let thesis_data;
        if (thesis_assigned[0]) {
          // we get extra thesis data (like title)
          thesis_data = await ThesisModel.findById(thesis_assigned[0].thesis);

          const professor = await UserModel.findById(
            thesis_assigned[0].professor,
          );

          //the supervisors
          //console.log(thesis_assigned[0].supervisor)

          converted_data.date = thesis_assigned[0].date;
          converted_data.thesis = thesis_data!;
          converted_data.thesis.status = thesis_assigned[0].status;
          converted_data.thesis.professor = professor!.email;
          thesis_assigned[0].supervisor.map((sup) => {
            converted_data.supervisor!.push(sup);
          }); // ids of the supervisors
        } else {
          converted_data.thesis = thesis_data;
        }

        res.data = converted_data;
        // console.log(res.data);
        next();
      } catch (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Server internal error occurred!" });
      }
    };
  }

  /* private convertDepartmentsData() {
  return async (req: Request, res: CustomResponse, next: NextFunction) => {
    try {
      let converted_data = [];

      if (res.paginatedData!.results) {
        let index = 0;
        while (res.paginatedData!.results[index]) {
          const find_university = await UniversityModel.findById(
            res.paginatedData!.results[index].university,
            "name"
          );

          res.paginatedData.results[index].university = find_university.name;
          index++;
        }
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  };
} */
}
