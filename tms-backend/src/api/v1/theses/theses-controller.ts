import { Request, Response, Router } from "express";
import { IThesis, Thesis_t, ThesisModel } from "./theses-model";
import { ResourceController } from "../../shared";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../shared/utils/logger";

export class ThesisController extends ResourceController<IThesis> {
  private logger: Logger = Logger.getInstance();
  constructor() {
    super(ThesisModel);
    this.checkAndInitialize();
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
    /* const allTheses = await this.getAll(req, res); */
    const allTheses = await this.modelSchema.deleteMany({});
    this.logger.success("All theses items deleted");
    return res.status(StatusCodes.OK).json(allTheses);
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
        return res.json(data);
      })
      .catch((err: any) => {
        this.logger.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
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
        title: "Energy-Efficient Cache Architectures for Modern CPUs",
        topic: "Improving CPU cache design for reduced power consumption",
        area: "Computer architecture and microelectronics",
        description:
          "Research on designing cache architectures for modern CPUs with a focus on energy efficiency.",
        prerequisites:
          "Knowledge of computer architecture and power management",
        group: "MSc",
        professor: "",
        required_files: ["proposal.pdf", "cache_design_diagram.pdf"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Hardware Acceleration for Cryptographic Algorithms",
        topic: "Designing hardware for faster cryptographic processing",
        area: "Computer architecture and microelectronics",
        description:
          "Exploring hardware-based solutions for accelerating cryptographic operations.",
        prerequisites:
          "Basic understanding of cryptography and hardware design",
        group: "PhD",
        professor: "",
        required_files: ["proposal.pdf", "hardware_simulation_results.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Reconfigurable FPGA-Based Systems for AI Applications",
        topic: "Utilizing FPGAs for flexible AI implementations",
        area: "Computer architecture and microelectronics",
        description:
          "Developing reconfigurable FPGA-based systems for real-time AI computations.",
        prerequisites: "Understanding of FPGAs and AI workloads",
        group: "MSc",
        professor: "",
        required_files: ["proposal.pdf", "fpga_design_files.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Chip-Level Security Mechanisms for IoT Devices",
        topic: "Integrating security features into IoT microchips",
        area: "Computer architecture and microelectronics",
        description:
          "A study on chip-level security enhancements to protect IoT devices from physical attacks.",
        prerequisites: "Knowledge of microelectronics and security",
        group: "BSc",
        professor: "",
        required_files: ["proposal.pdf", "security_mechanism_diagram.pdf"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Optimized Workload Distribution in Cloud Environments",
        topic: "Improving parallel task scheduling in cloud systems",
        area: "Computer systems, parallel and high performance computing",
        description:
          "Research on optimized workload distribution for parallel computing in cloud environments.",
        prerequisites: "Knowledge of cloud computing and parallel algorithms",
        group: "PhD",
        professor: "",
        required_files: ["proposal.pdf", "task_distribution_code.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "High-Performance Computing for Genomic Data Analysis",
        topic: "Using HPC to analyze large-scale genomic datasets",
        area: "Computer systems, parallel and high performance computing",
        description:
          "Exploring HPC techniques to enhance the speed and accuracy of genomic data analysis.",
        prerequisites: "Familiarity with bioinformatics and parallel computing",
        group: "MSc",
        professor: "",
        required_files: ["proposal.pdf", "genomic_data.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Adaptive Scheduling Algorithms for Supercomputers",
        topic: "Designing scheduling algorithms for high-performance systems",
        area: "Computer systems, parallel and high performance computing",
        description:
          "Research on adaptive algorithms for resource allocation in supercomputing environments.",
        prerequisites:
          "Understanding of scheduling algorithms and HPC architectures",
        group: "MSc",
        professor: "",
        required_files: ["proposal.pdf", "algorithm_demo.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Securing Decentralized Applications with Smart Contracts",
        topic:
          "Enhancing the security of decentralized systems through smart contracts",
        area: "Computer security and distributed systems",
        description:
          "A study on using smart contracts to improve the security of decentralized applications.",
        prerequisites: "Knowledge of blockchain and distributed systems",
        group: "MSc",
        professor: "",
        required_files: ["proposal.pdf", "smart_contract_code.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Distributed Denial-of-Service Mitigation in IoT Networks",
        topic: "Developing strategies to protect IoT systems from DDoS attacks",
        area: "Computer security and distributed systems",
        description:
          "Exploring advanced techniques to mitigate distributed denial-of-service attacks in IoT networks.",
        prerequisites: "Familiarity with IoT and network security",
        group: "MSc",
        professor: "",
        required_files: ["proposal.pdf", "ddos_defense_diagram.pdf"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },

      {
        title: "Consensus Algorithms for Scalable Blockchain Systems",
        topic:
          "Improving scalability in blockchain with novel consensus mechanisms",
        area: "Computer security and distributed systems",
        description:
          "A study on designing and implementing efficient consensus algorithms for large-scale blockchain systems.",
        prerequisites:
          "Knowledge of blockchain architecture and distributed algorithms",
        group: "PhD",
        professor: "",
        required_files: ["proposal.pdf", "consensus_simulation.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },

      {
        title: "Low-Power Microprocessor Design for Edge Computing",
        topic: "Optimizing edge devices for energy efficiency and performance",
        area: "Computer architecture and microelectronics",
        description:
          "Research on low-power microprocessor architectures tailored for edge computing applications.",
        prerequisites:
          "Basic understanding of computer architecture and low-power design",
        group: "MSc",
        professor: "677da031265a76563c377c57",
        required_files: ["proposal.pdf", "simulation_results.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Accelerating Big Data Processing with GPU Clusters",
        topic: "Leveraging GPU clusters for high-performance data analysis",
        area: "Computer systems, parallel and high performance computing",
        description:
          "Exploration of GPU-based parallel computing to accelerate big data analytics workflows.",
        prerequisites:
          "Knowledge of GPU programming and big data processing frameworks",
        group: "PhD",
        professor: "677da031265a76563c377c57",
        required_files: ["proposal.pdf", "codebase.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Blockchain-Based Solutions for Secure IoT Systems",
        topic:
          "Developing secure frameworks for IoT using blockchain technology",
        area: "Computer security and distributed systems",
        description:
          "Research on enhancing IoT security through the integration of blockchain-based distributed systems.",
        prerequisites:
          "Familiarity with blockchain concepts and IoT security challenges",
        group: "MSc",
        professor: "677da031265a76563c377c57",
        required_files: ["proposal.pdf", "architecture_diagram.pdf"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Traffic Load Balancing in 5G Networks",
        topic:
          "Optimizing resource allocation for next-generation mobile networks",
        area: "Computer networks, mobile computing, and telecommunications",
        description:
          "A study on traffic load balancing techniques for efficient resource allocation in 5G networks.",
        prerequisites:
          "Basic knowledge of 5G technologies and traffic engineering",
        group: "BSc",
        professor: "677da031265a76563c377c57",
        required_files: ["proposal.pdf", "traffic_analysis.csv"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "AI-Enhanced Signal Processing for Smart Grids",
        topic:
          "Applying artificial intelligence to improve signal processing in energy grids",
        area: "Signal processing and analysis",
        description:
          "Developing AI-powered signal processing techniques to optimize the performance of smart grids.",
        prerequisites:
          "Understanding of AI techniques and signal processing fundamentals",
        group: "MSc",
        professor: "677da031265a76563c377c57",
        required_files: ["proposal.pdf", "signal_analysis_results.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
      },
      {
        title: "Designing Immersive AR Interfaces for Remote Learning",
        topic:
          "Creating augmented reality tools to improve remote education experiences",
        area: "Computer graphics and human-computer interaction",
        description:
          "Exploration of augmented reality interfaces for engaging remote learning environments.",
        prerequisites:
          "Basic understanding of AR development and HCI principles",
        group: "BSc",
        professor: "677da031265a76563c377c57",
        required_files: ["proposal.pdf", "ar_demo_app.zip"],
        thesis_files: ["final_report.pdf"],
        status: "active",
        date: new Date("2024-09-01"),
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
