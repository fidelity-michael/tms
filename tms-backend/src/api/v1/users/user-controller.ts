import { Request, Response, Router } from "express";
import { IUser, UserModel, User_t } from "./user-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import multer from "multer";
import fs from "fs";

import bcrypt from "bcryptjs";
import path from "path";

export class UserController extends ResourceController<IUser> {
  private logger: Logger = Logger.getInstance();
  private storage;
  private upload;
  constructor() {
    super(UserModel);
    this.checkAndInitialize(); // NOTE: This should initialize
    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/uploads/images/");
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
      },
    });
    this.upload = multer({ storage: this.storage });
  }

  /**
   * Apply all routes for users
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getUsers) // TODO: remove get request and initialize
      .get("/initialize", this.initializeUsers)
      .get("/:userId", this.getUserById)
      .post("/", this.postUser)
      .put("/:userId", this.updateUser)
      .patch("/:userId", this.patchUser)
      /* .delete("/all", this.deleteAllUsers) */
      .delete("/:userId", this.deleteUser)
      .get("/getProfileImage/:userId", this.getProfileImage)
      .patch("/uploadProfileImage/:userId", this.uploadImage);

    return router;
  }

  /**
   * Delete all users
   * @param req
   * @param res
   */
  deleteAllUsers = async (req: Request, res: Response) => {
    this.logger.debug("deleteAll request");
    const allUsers = await this.getAll(req, res);
    if (allUsers) {
      for (const item of allUsers) {
        await this.delete(item._id.toString(), req, res);
      }
      this.logger.success("All users items deleted");
    }
  };

  uploadImage = async (req: Request, res: Response) => {
    this.logger.debug("uploadImage request");
    try {
      const userId = req.params.userId;
      // @ts-ignore: Suppressing type error for custom file structure
      const file = req.files.image;

      this.logger.debug("file: ", file);

      if (!file /* || !file.image */) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "No image uploaded" });
      }

      const directory = path.resolve(__dirname, "public/uploads/images"); // NOTE: Works

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      } else {
        fs.chmodSync(directory, 0o755);
      }

      /* const base64Image = file.buffer.toString("base64"); */
      /* const base64Image = imageBuffer.toString("base64"); */
      const data = file.data;
      await UserModel.updateOne(
        { _id: userId },
        { $set: { profileImage: data } },
      );

      const ext = path.extname(file.name);
      const name = path.basename(file.name, ext);
      this.logger.debug("name: ", name);
      this.logger.debug("dir: ", directory);
      const filenameTimestamp = `${name}_${Date.now()}${ext}`;
      const filePath = path.join(directory, filenameTimestamp);

      /* newFilenames.push(filenameTimestamp); */

      await new Promise<void>((resolve, reject) => {
        file.mv(filePath, (err: any) => {
          if (err) {
            console.error("File move error:", err);
            reject(err);
          } else {
            this.logger.debug("File uploaded:", filenameTimestamp);
            resolve();
          }
        });
      });

      res
        .status(StatusCodes.OK)
        .send({ message: "Image uploaded successfully" });
    } catch (err: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Internal Server Error" });
    }
  };

  getProfileImage = async (req: Request, res: Response) => {
    this.logger.debug("getProfileImage request");
    const user = await this.getOne(req.params.userId, req, res);
    return res.status(StatusCodes.OK).json(user);
  };

  /**
   * Sends a message containing all users back as a response
   * @param req
   * @param res
   */
  getUsers = async (req: Request, res: Response) => {
    this.logger.debug("getUsers request");
    const allUsers = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allUsers);
  };

  /**
   * Get a single user by id
   * @param req
   * @param res
   */
  getUserById = async (req: Request, res: Response) => {
    this.logger.debug("getUserById request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.getOne(req.params.userId, req, res);

    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Creates a new user
   * @param req
   * @param res
   */
  postUser = async (req: Request, res: Response) => {
    this.logger.debug("postUser request");
    // Check if user email already exists in the database
    const user = await UserModel.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .send({ message: "User already exists in database!" });

    // Hash passwords
    const saltRounds = await bcrypt.genSalt(10);
    const plainPass = req.body.password;
    const hashedPass = await bcrypt.hash(plainPass, saltRounds);

    // Create a new User
    try {
      const user = new UserModel({
        first_name: req.body.first_name ? req.body.first_name : "FirstName",
        last_name: req.body.last_name ? req.body.last_name : "LastName",
        email: req.body.email,
        password: hashedPass,
        role: req.body.role,
        group: req.body.group,
        profileImage: "",
        // thesis: req.body.thesis,
      });

      const saved_user = await user.save();
      res.send({ user: user._id });
    } catch (err) {
      res.status(400).send(err);
    }
  };

  /**
   * Delete user by id
   * @param req
   * @param res
   */
  deleteUser = async (req: Request, res: Response) => {
    this.logger.debug("deleteUser request");
    // you can pre-process the request here before passing it to the super class method
    const user = await this.delete(req.params.userId, req, res);
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(user);
  };

  /**
   * Update user by id (with PUT request)
   * @param req
   * @param res
   */
  updateUser = async (req: Request, res: Response) => {
    this.logger.debug("updateUser request");
    // you can pre-process the request here before passing it to the super class method
    const task = await this.update(
      req.params.userId,
      req.body.blacklist,
      req,
      res,
    ); // WARN: check for correct params
    // you can process the data retrieved here before returning it to the client
    return res.status(StatusCodes.OK).json(task);
  };

  /**
   * Patch user by id (with PATCH request)
   * @param req
   * @param res
   */
  patchUser = async (req: Request, res: Response) => {
    this.logger.debug("patch user request");
    // you can pre-process the request here before passing it to the super class method
    const updated_user = await UserModel.updateOne(
      { _id: req.params.userId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("Server internal error occurred!");
      });
  };

  encryptPass = async (plainPass: any, rounds: any) => {
    const saltRounds = await bcrypt.genSalt(rounds);
    const hashedPass = await bcrypt.hash(plainPass, saltRounds);
    return hashedPass;
  };

  /**
   * Initialize users
   * @param req
   * @param res
   */
  private initializeUsers = async (): Promise<void> => {
    this.logger.debug("Initialize users request");

    const usersToInsert: User_t[] = [
      {
        email: "student@csd.uoc.gr",
        password: await this.encryptPass("student", 10),
        role: ["student"],
        group: "BSc",
        department: "5f89b089099c8d21dc2d9ef8",
      },
      {
        email: "professor@csd.uoc.gr",
        password: await this.encryptPass("professor", 10),
        role: ["professor"],
        group: "Professor",
        department: "5f89b089099c8d21dc2d9ef8",
      },
      {
        email: "secretariat@csd.uoc.gr",
        password: await this.encryptPass("secretariat", 10),
        role: ["secretariat"],
        group: "Secretariat",
        department: "5f89b089099c8d21dc2d9ef8",
      },
      {
        email: "admin@csd.uoc.gr",
        password: await this.encryptPass("admin", 10),
        role: ["administrator"],
        group: "Administrator",
        department: "5f89b089099c8d21dc2d9ef8",
      },
    ];

    await UserModel.insertMany(usersToInsert)
      .then(() => {
        this.logger.success("Users initialized successfully!");
      })
      .catch((err) => {
        this.logger.error(err);
      });
  };

  /**
   *  Check if Model is empty, if empty initialize document
   */
  private async checkAndInitialize(): Promise<void> {
    try {
      const data = await UserModel.findOne({});
      if (!data) {
        this.initializeUsers();
      }
    } catch (error) {
      this.logger.error("Error ocurred in user initialization: ", error);
    }
    // UserModel.findOne({}, function (this: UserController, err: any, docs: any) {
    //   if (err) {
    //     console.log(err);
    //   } else if (!docs) {
    //     this.initializeUsers();
    //   }
    // });
  }
}
