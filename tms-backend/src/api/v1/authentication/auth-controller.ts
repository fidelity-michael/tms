import { NextFunction, Request, Response, Router } from "express";
import { IAuth, AuthModel } from "./auth-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import mongoose, { ObjectId } from "mongoose"

import bcrypt from "bcryptjs";
import LdapClient from "ldapjs-client";
import fs from "fs";
import jwt from "jsonwebtoken";
import { IUser, UserModel } from "../users/user-model";

declare module "express-session" {
  interface SessionData {
    user: {
      id: ObjectId;
      role: string[];
      group: string;
      email: string;
    };
  }
}

// Define a custom interface to ensure req has a results property
interface CustomRequest extends Request {
  results?: {
    auth: string;
    email: string;
    role: string;
    group: string;
  };
  data?: Array<{ cn: string; mail: string }>;
}

// Define a custom interface to ensure req has a results property
interface CustomResponse extends Response {
  results?: {
    auth?: string;
    email?: string;
    role?: string;
    group?: string;
    message?: string;
  };
  data?: Array<{ cnDn: { cn: string; dn:string; }; mail: string; eduPersonAffiliation: string; businessCategory: string }>;
}

export class AuthenticationController extends ResourceController<IAuth> {
  private logger: Logger = new Logger();

  private encryptPass = async (plainPass: any, rounds: any) => {
    const saltRounds = await bcrypt.genSalt(rounds);
    const hashedPass = await bcrypt.hash(plainPass, saltRounds);
    return hashedPass;
  };

  private client = new LdapClient({
    url: "ldap://ds.uoc.gr:389",
  });

  constructor() {
    super(AuthModel);
  }
  /**
   * Apply all routes for tasks
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/authorization", this.authorization)
      .post(
        "/ldap_login",
        this.ldapSearch(),
        this.ldapAuthenticate(),
        this.modifyData(),
        this.loginWithLDAP,
      )
      .post("/login", this.loginWithoutLDAP)
      .post("/logout", this.logout);
    return router;
  }

  /**
   * User authorization
   * @param req
   * @param res
   */
  authorization = async (req: Request, res: Response) => {
    if (req.session.user) {
      const server_res = {
        id: req.session.user.id,
        role: req.session.user.role,
        group: req.session.user.group,
        email: req.session.user.email,
        message: "User is signed in!",
        auth: true,
      };

      res.json(server_res);
    } else {
      const server_res = {
        message: "User is not authorized! Please sing in.",
        auth: false,
      };

      res.json(server_res);
    }
  };

  /**
   * Login using LDAP client
   * @param req
   * @param res
   */
  loginWithLDAP = async (req: Request, res: CustomResponse) => {
    try {
      if (res.results!.auth === "fail") {
        this.logger.debug("User Results (FAIL): " + res.results);
        return res.status(400).json(res.results);
      } else {
        this.logger.debug("User Results (SUCCESS): " + res.results);
        const user = await UserModel.findOne({ email: res.results!.email });
        if (user) {
          this.logger.debug("User found in database: ", user);
          // Create and assign token
          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "4h" },
          );

          const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET as string,
          );

          // Create user session
          req.session.user = {
            id: user._id,
            role: user.role,
            group: user.group,
            email: user.email,
          };

          // Send back token and user's role
          const server_res = {
            message: "Authentication successful!",
            accessToken: accessToken,
            role: user.role[0], //epeidh pleon exoume pollous rolous. sundeomaste me ton prwto
          };

          res.header("Access-Token", accessToken).send(server_res);
        } else {
          this.logger.debug("User not found in database!");
          try {
            const insertUser = async () => {
              UserModel.create({
                first_name: res.data![0].cnDn.cn.split(" ")[0],
                last_name: res.data![0].cnDn.cn.split(" ")[1],
                email: res.data![0].mail,
                password: await this.encryptPass(req.body.password, 10),
                role: res.results!.role,
                group: res.results!.group,
                department: "5f89b089099c8d21dc2d9ef8",
              })
                .then((user) => {
                  this.logger.debug("New User inserted: " + user);
                  // Create and assign token
                  const accessToken = jwt.sign(
                    { _id: user._id },
                    process.env.ACCESS_TOKEN_SECRET as string,
                    { expiresIn: "4h" },
                  );

                  const refreshToken = jwt.sign(
                    { _id: user._id },
                    process.env.REFRESH_TOKEN_SECRET as string,
                  );

                  // Create user session
                  req.session.user = {
                    id: user._id,
                    role: user.role,
                    group: user.group,
                    email: user.email,
                  };

                  // Send back token and user's role
                  const server_res = {
                    message: "Authentication successful!",
                    accessToken: accessToken,
                    role: user.role,
                  };

                  res.header("Access-Token", accessToken).send(server_res);
                })
                .catch((err) => {
                  this.logger.error("Server internal error occurred: " + err);
                  return res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .send("Server internal error occurred: " + err);
                });
            };

            insertUser();
          } catch (err) {
            this.logger.error("Server internal error occurred: " + err);
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .send("Server internal error occurred: " + err);
          }
        }
      }
    } catch (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Server internal error occurred: " + err);
    }
  };

  /**
   *  TODO: Fix errors here
   *
   * Login to Web App as tst user (not ldap)
   * @param req
   * @param res
   */
  loginWithoutLDAP = async (req: CustomRequest, res: CustomResponse) => {
    mongoose.connection.on("error", (err) => {
      this.logger.error("MongoDB failed to connect!")
      res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err);
    });

    // Validate data before add a new user
    // const { error, value } = loginValidation(req.body);
    // if (error) {
    //   const server_res = {
    //     message: error.details[0].message,
    //   };

    //   return res.status(400).send(server_res);
    // }

    let user: IUser | null;
    try {
      // Check if user email exists in the database
      user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        const server_res = {
          message: "User not registered in database!",
        };

        return res.status(StatusCodes.NOT_FOUND).send(server_res);
      }

    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server failed to connect with database."); 
    }

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, 
      user.password);
    if (!validPass) {
      const server_res = {
        message: "User password is incorrect!",
      };

      return res.status(400).send(server_res);
    }

    // Create and assign token
    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "4h" },
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET as string,
    );

    // Create user session
    req.session.user = {
      id: user._id,
      role: user.role,
      group: user.group,
      email: user.email,
    };

    // Send back token and user's role
    const server_res = {
      message: "Authentication successful!",
      accessToken: accessToken,
      role: user.role[0], //giati pleon exoumme pollous rolous. opote sundeomaste me ton prwto
    };

    res.header("Access-Token", accessToken).send(server_res);
  };

  logout = async (req: Request, res: Response) => {
    req.session.destroy(function (err) {
      if (err) res.status(500).send("Server failed to delete session!");
      else {
        res.send("Server deleted session successfully!");
      }
    });
  };

  /**
   * Search user in ldap
   * @param req
   * @param res
   */
  ldapSearch() {
    return async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
      try {
        const email = req.body.email;
        const searchOptions = {
          filter: "(mail=" + email + ")",
          scope: "sub",
          attributes: [
            "cn",
            "mail",
            "eduPersonAffiliation",
            "businessCategory",
          ],
        };

        const baseDN = "ou=csd,dc=uoc,dc=gr";
        const entries = await this.client
          .search(baseDN, searchOptions)
          .catch((err) => {
            this.logger.error(
              "LDAP connection error occurred! Please check your VPN connection. Error: " +
                err,
            );
            res.data = [];
            next();
          });

        // console.log("Search Data (sent): ", entries);
        res.data = entries as any;
        next();
      } catch (err: any) {
        this.logger.error("Server internal error occurred: " + err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
        next();
      }
    };
  }

  ldapAuthenticate() {
    return async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
      try {
        if (Object.keys(res.data!).length === 0) { // "!" it's not undefined, neither null
          // console.log("LDAP user not found!");
          res.results = {
            auth: "fail",
            message: "LDAP user not found!",
          };
          next();
        } else {
          // console.log("Authenticate Data (received): ", res.data);
          const password = req.body.password;
          const dn = res.data![0].cnDn.dn;
          // console.log("User dn: ", dn);
          try {
            await this.client.bind(dn, password);
            // console.log("LDAP Bind succeeded!");
            res.results = {
              auth: "success",
              message: "LDAP authentication succeeded!",
            };
          } catch (e) {
            // console.log("LDAP Bind failed: ", e);
            res.results = {
              auth: "fail",
              message: "LDAP authentication failed!",
            };
          }
          next();
        }
      } catch (err: any) {
        this.logger.error("Server internal error occurred: " + err);
        res.status(500).json({ message: err.message });
        next();
      }
    };
  }

  modifyData() {
    return async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
      try {
        // if(res.results.auth === "fail") {
        //   res.status(400).send(res.results);
        // }
        // else {
        //  User Authenticated
        // }

        // console.log("Modify Results: ", res.results);
        if (res.data![0]) {
          this.logger.debug("User Entry: ", res.data![0]);
          const role = res.data![0].eduPersonAffiliation
            ? res.data![0].eduPersonAffiliation.toLowerCase()
            : "undefined";

          // console.log("User Role: ", role);
          if (role === "faculty") {
            res.results!.role = "professor";
            res.results!.group = "Professor";
            res.results!.email = res.data![0].mail;
          } else if (role === "student") {
            const group = res.data![0].businessCategory.toLowerCase();
            res.results!.role = "student";
            res.results!.group =
              group === "ugrad"
                ? "BSc"
                : group === "msc"
                  ? "MSc"
                  : group === "phd"
                    ? "PhD"
                    : "undefined";
            res.results!.email = res.data![0].mail;
          } else {
            // console.log("Reading staff file..");
            // Read staff.json file
            const data = fs.readFileSync("public/staff.json", {
              encoding: "utf8",
              flag: "r",
            });

            const users = JSON.parse(data);
            if (users) {
              let find_user = users["administrator"].find(
                (user: IUser) => user.email === res.data![0].mail,
              );

              if (!find_user) {
                find_user = users["secretariat"].find(
                  (user: IUser) => user.email === res.data![0].mail,
                );
                if (!find_user) {
                  find_user = users["professor"].find(
                    (user: IUser) => user.email === res.data![0].mail,
                  );
                }
              }

              if (find_user) {
                // console.log("User found: ", find_user);
                res.results!.role = find_user.role;
                res.results!.group = find_user.group;
                res.results!.email = find_user.email;
              } else {
                // console.log("User not found!");
                res.results!.auth = "fail";
                res.results!.message = "User not found!";
              }
            } else {
              this.logger.debug("Staff file is empty!");
              res.results!.auth = "fail";
              res.results!.message = "User not found!";
            }
          }
        } else {
          res.results!.auth = "fail";
          res.results!.message = "LDAP user not found!";
        }

        next();
      } catch (err: any) {
        this.logger.error("Server internal error occurred: " + err);
        res.status(500).json({ message: err.message });
        next();
      }
    };
  }
}
