import { Request, Response, Router } from "express";
import { IThesesReq, ThesesReqModel, ThesesReq_t } from "./theses-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";
import { ThesisModel } from "../theses/theses-model";
import fs from "fs"

export class ThesesReqController extends ResourceController<IThesesReq> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(ThesesReqModel);
    this.checkResetDate();
  }
  /**
   * Apply all routes for theses requests
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getThesesRequests)
      .get("/student/:userId", this.getThesesRequests)
      .post("/", this.postThesis)
      .patch("/:requestId", this.updateThesisReq)
      .patch("/reapply/:requestId", this.updateThesisReqFiles);

    return router;
  }

  /**
   * Sends a message containing all theses requests of a student
   * back as a response
   * @param req
   * @param res
   */
  getThesesRequests = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("getThesesRequests request");
    const student_requests = await this.modelSchema
      .find({ student: req.params.userId })
      .then((data) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Creates a new thesis
   * @param req
   * @param res
   */
  postThesis = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("postThesis request");
    try {
      const thesis = await ThesisModel.find({ _id: req.body.thesis });
      let professor = "";
      if (thesis[0]) {
        professor = thesis[0].professor;
      } else {
        throw this.logger.error(
          "An error occurred: Thesis not found in database!",
        );
      }

      const thesis_request = new ThesesReqModel({
        thesis: req.body.thesis,
        student: req.body.student,
        professor: professor,
        required_files: req.body.required_files,
        date: Date.now(),
      });

      const saved_thesis_request = await thesis_request.save();
      res.status(StatusCodes.OK).send({ thesis_request: thesis_request._id });
    } catch (err) {
      this.logger.error("" + err);
      res.status(StatusCodes.BAD_REQUEST).send(err);
    }
  };

  /**
   * Update thesis by id (for status)
   * @param req
   * @param res
   */
  updateThesisReq = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("updateThesisReq request");
    const updated_request = await this.modelSchema
      .updateOne(
        { _id: req.params.requestId },
        { $set: { status: req.body.status } },
      )
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
      });
  };

  /**
   * Update thesis by id (Reapply files)
   * @param req
   * @param res
   */
  updateThesisReqFiles = async (req: Request, res: Response) => {
    // NOTE: Works
    this.logger.debug("updateThesisReqFiles request");
    this.logger.debug("Id: ", req.params.requestId);
    this.logger.debug("Files: ", req.body.files);
    const updated_request = await this.modelSchema
      .updateOne(
        { _id: req.params.requestId },
        { $set: { required_files: req.body.files } },
      )
      .then((data: any) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch((err) => {
        this.logger.error("Server internal error occurred!");
      });
  };

  // TODO: Fix this
  private checkResetDate() {
    // Check reset date
    setInterval(function () {
      const now = new Date();
      let month = new Array();
      month[0] = "January";
      month[1] = "February";
      month[2] = "March";
      month[3] = "April";
      month[4] = "May";
      month[5] = "June";
      month[6] = "July";
      month[7] = "August";
      month[8] = "September";
      month[9] = "October";
      month[10] = "November";
      month[11] = "December";

      const today_date: any = now.getDate();
      const today_month = month[now.getMonth()];
      // console.log("Today: ", today_date, today_month);

      // Read timer.json file
      const data = fs.readFileSync("public/timer.json", {
        encoding: "utf8",
        flag: "r",
      });

      console.log("Checking reset date..");
      const timers = JSON.parse(data);
      // console.log(timers.reset_date);
      timers.reset_date.map((date: any) => {
        const timer_date: any = date.split(" ")[0];
        const timer_month: any = date.split(" ")[1];

        if (
          parseInt(timer_date) === parseInt(today_date) &&
          timer_month === today_month
        ) {
          // Deleting all requests with status declined! We could store them in different document of file if necessary.
          // Another way of filtering: We could search every 't' minutes for declined requests and delete the ones with
          // date more than 'n' months from Date.now

          // Save Declined
          console.log("Saving declined requests..");
          ThesesReqModel.find({ status: "declined" })
            .then((requests) => {
              // console.log(requests);
              if (requests.length > 0) {
                // If file becomes over 'n' MBytes we should delete the file or save data in a database engine
                const data = fs.readFileSync("public/declined_requests.txt", {
                  encoding: "utf8",
                  flag: "r",
                });

                // convert to json
                const json = JSON.parse(data);
                // push current declined requests
                requests.map((request) => {
                  json.requests.push(request);
                });

                // convert to string
                const str_data = JSON.stringify(json);
                console.log(str_data);
                // write back to file
                fs.writeFileSync("public/declined_requests.txt", str_data, {
                  flag: "w+",
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });

          // console.log("Deleting declined requests..");
          // Delete Declined Requests
          ThesesReqModel.deleteMany({ status: "declined" })
            .then(() => {
              console.log("Requests deleted!");
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      });
    }, 43200000); // check every 12 hours
  }
}
