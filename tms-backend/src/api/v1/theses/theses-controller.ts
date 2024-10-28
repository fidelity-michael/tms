import { Request, Response, Router } from "express";
import { IThesis, Thesis_t, ThesisModel } from "./theses-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class ThesisController extends ResourceController<IThesis> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(ThesisModel);
    // this.checkAndInitialize();
  }
  /**
   * Apply all routes for theses
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    const router = Router();
    router
      .get("/", this.getTheses) // TODO: Probably remove this get() func
      .get("/:thesisId", this.getThesisById)
      .post("/", this.postThesis)
      .patch("/:thesisId", this.patchThesis)
      .delete("/all", this.deleteAll)
      .delete("/:thesisId", this.deleteThesis);
    return router;
  }

  /**
   * Delete all theses
   * @param req
   * @param res
   */
  deleteAll = async (req: Request, res: Response) => {
    this.logger.debug("deleteAll request");
    const allTheses = await this.getAll(req, res);
    if (allTheses) {
      for (const item of allTheses) {
        await this.delete(item._id.toString(), req, res);
      }
      this.logger.success("All theses items deleted");
    }
  };

  /**
   * Sends a message containing all theses back as a response
   * @param req
   * @param res
   */
  getTheses = async (req: Request, res: Response) => {
    this.logger.debug("getTheses request");
    const allTheses = await this.getAll(req, res);
    return res.status(StatusCodes.OK).json(allTheses);
  };

  /**
   * Get user's thesis info
   * @param req
   * @param res
   */
  getThesisById = async (req: Request, res: Response) => {
    this.logger.debug("getThesisById request");
    await ThesisModel.find({ _id: req.params.thesisId })
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        this.logger.error("" + StatusCodes.INTERNAL_SERVER_ERROR);
      });
  };

  /**
   * Creates a new thesis and send back the unique _id
   * @param req
   * @param res
   */
  postThesis = async (req: Request, res: Response) => {
    // NOTE: Works as intented
    this.logger.debug("postThesis request");
    const thesis = await this.create(req, res);
    return res.status(StatusCodes.OK).json({ thesis: thesis._id });
  };

  /**
   * Patches a assigned thesis
   * @param req
   * @param res
   */
  patchThesis = async (req: Request, res: Response) => {
    this.logger.debug("patchThesis request");
    await ThesisModel.updateOne(
      { _id: req.params.thesisId },
      { $set: { [req.body.attr]: req.body.value } },
    )
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        console.log("Server internal error occurred!");
      });
  };

  /**
   * Remove Thesis with param the thesisId
   * @param req
   * @param res
   */
  deleteThesis = async (req: Request, res: Response) => {
    this.logger.debug("deleteThesis request"); // NOTE: _id is used to delete a resource
    const thesis = await this.delete(req.params.thesisId, req, res);
    return res.status(StatusCodes.OK).json(thesis);
  };

  /**
   * Initialize theses if database is empty
   * @returns Promise<void>
   */
  private async checkAndInitialize(): Promise<void> {
    try {
      const data = await ThesisModel.findOne({});
      if (!data) {
        this.initializeTheses();
      }
    } catch (error) {
      this.logger.error("Error ocurred in university initialization: ", error);
    }
  }
  initializeTheses = async () => {
    this.logger.debug("initializeTheses request");

    const thesesToInsert: Thesis_t[] = [
      {
        title: "Machine Learning in Healthcare",
        topic: "Artificial Intelligence",
        area: "Healthcare",
        description:
          "An exploration of machine learning applications in healthcare.",
        prerequisites: "Basic knowledge of AI and healthcare systems",
        group: "Group A",
        professor: "Dr. John Smith",
        required_files: ["proposal.pdf", "data.csv"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Blockchain in Finance",
        topic: "Finance Technology",
        area: "Finance",
        description:
          "Study of blockchain applications in the financial sector.",
        prerequisites: "Understanding of blockchain technology",
        group: "Group B",
        professor: "Dr. Alice Johnson",
        required_files: ["project_outline.pdf"],
        thesis_files: ["research_paper.pdf"],
        status: "archived",
        date: new Date("2024-06-15"),
      },
      {
        title: "Cybersecurity and Cloud Computing",
        topic: "Cybersecurity",
        area: "Cloud Computing",
        description:
          "Evaluating cybersecurity challenges in cloud environments.",
        prerequisites: "Background in cybersecurity and cloud computing",
        group: "Group C",
        professor: "Dr. Emily Davis",
        required_files: ["security_protocols.pdf"],
        thesis_files: ["final_presentation.pdf"],
        status: "active",
        date: new Date("2024-12-20"),
      },
    ];

    await ThesisModel.insertMany(thesesToInsert)
      .then(() => {
        this.logger.success("Theses initialized successfully!");
      })
      .catch((err) => {
        this.logger.error("Error initializing theses: ", err);
      });
  };
}
