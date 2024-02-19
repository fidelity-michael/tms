const router = require("express").Router();
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const University = require("../models/University");
const Department = require("../models/Department");
const Area = require("../models/Area");
const User = require("../models/User");
const Thesis = require("../models/Thesis");
const Favourite = require("../models/Favourite");
const ThesisRequest = require("../models/ThesisRequest");
const AssignedThesis = require("../models/AssignedThesis");
const ThesisReport = require("../models/ThesisReport");
//const Notification = require("../models/Notification");

// Upload file
router.post("/uploads/:folderName", async (req, res) => {
  try {
    
    const folder = req.params.folderName;
    const files = req.files.files;
    
    let newFilenames = [];

    if (
      !(folder === "theses" || folder === "requests" || folder === "reports" || folder === "chat")
    ) {
      res.status(401).send({ message: "Folder doesn't exist!" });
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
              console.log("Modified Names: ", filename_timestamp);
              // console.log(`File Path: ./public/uploads/${folder}/${filename_timestamp}`);
            }
          });

          return index;
        })
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
});

// HTTP Request to verify JWT token
router.get("/uploads", async (req, res) => {
  try {
    // console.log(`${__dirname}`);
    let directory = "./public/uploads/";
    filenames = fs.readdirSync(directory);

    if (filenames.length == 0) {
      console.log("\nNo files in directory!");
    } else {
      console.log("\nCurrent directory filenames:");
      filenames.forEach((file) => {
        console.log(file);
      });
    }

    res.send(filenames);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server internal error occurred!" });
  }
});

router.get("/downloads/:folderName/:fileName", async (req, res) => {
  try {
    const folder = req.params.folderName;
    const file = req.params.fileName;

    // console.log("Folder name: ", folder);
    // console.log("File to send: ", file);

    if (
      !(folder === "theses" || folder === "requests" || folder === "reports" || folder === "chat")
    ) {
      res.status(401).send({ message: "Folder doesn't exist!" });
    }

    const filepath = "./public/uploads/" + folder + "/" + file;
    var options = {
      root: "./public/uploads/" + folder + "/",
    };

    res.sendFile(file, options, (err, data) => {
      if (err) console.log(err);
      else console.log("Sent: ", file);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server internal error occurred!" });
  }
});

// Request all users in database
router.get("/users", paginatedData(User), (req, res) => {
  try {
    res.json(res.paginatedData);
  } catch (err) {
    res.status(500).json({ message: "Server internal error occurred!" });
  }
});

// Request all professors in database
router.get("/users/professors", async (req, res, next) => {
  const users_data = await User.find({ role: "professor" })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Request all admins in database
router.get("/users/admins", async (req, res, next) => {
  const users_data = await User.find({ role: "administrator" })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Request all secretariats in database
router.get("/users/secretariats", async (req, res, next) => {
  const users_data = await User.find({ role: "secretariat" })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Request specific user (with id) in database
router.get("/users/:userId", async (req, res, next) => {
  const users_data = await User.findById({ _id: req.params.userId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Request All universities in database
router.get("/universities", paginatedData(University), (req, res) => {
  try {
    res.json(res.paginatedData);
  } catch (err) {
    res.status(500).json({ message: "Server internal error occurred!" });
  }
});


function convertDepartmentsData() {
  return async (req, res, next) => {
    try {
      let converted_data = [];

      if (res.paginatedData.results) {
        let index = 0;
        while (res.paginatedData.results[index]) {
          const find_university = await University.findById(
            res.paginatedData.results[index].university,
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
}

// Request All departments in database
router.get(
  "/departments",
  paginatedData(Department),
  //convertDepartmentsData(),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

// Request specific user (with id) in database
router.get("/favourites/:userId", async (req, res, next) => {
  const users_data = await Favourite.find({ student: req.params.userId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Request areas for thesis dropdown
router.get("/thesis/areas", async (req, res, next) => {
  const areas_data = await Area.find({})
    .then((data) => {
      let areas = data.map((area) => {
        return {
          _id: area._id,
          name: area.name,
        };
      });

      // console.log(areas);
      areas.sort((a, b) => {
        let result = null;
        if (a.name && b.name)
          result = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
        return result;
      });
      res.json(areas);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Request All areas in database
router.get("/areas", paginatedAreaData(Area), (req, res) => {
  try {
    res.json(res.paginatedData);
  } catch (err) {
    res.status(500).json({ message: "Server internal error occurred!" });
  }
});

function convertThesesData() {
  return async (req, res, next) => {
    try {
      let converted_data = [];

      if (res.paginatedData.results) {
        let index = 0;
        while (res.paginatedData.results[index]) {
          const professor = await User.findById(
            res.paginatedData.results[index].professor,
            "email first_name last_name"
          );

          if (professor) {
            let newObject = {
              _id: res.paginatedData.results[index]._id,
              date: res.paginatedData.results[index].date,
              title: res.paginatedData.results[index].title,
              topic: res.paginatedData.results[index].topic,
              area: res.paginatedData.results[index].area,
              description: res.paginatedData.results[index].description,
              prerequisites: res.paginatedData.results[index].prerequisites,
              group: res.paginatedData.results[index].group,
              status: res.paginatedData.results[index].status,
              required_files: res.paginatedData.results[index].required_files,
              thesis_files: res.paginatedData.results[index].thesis_files,
              professor_id: professor._id,
              professor_email: professor.email,
              professor_name: professor.first_name + " " + professor.last_name,
            };

            converted_data.push(newObject);
          }

          index++;
        }

        // console.log("Current Data : ", res.paginatedData.results);
        // console.log("Converted Data : ", converted_data);
        res.paginatedData.results = converted_data;
      }

      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  };
}

// Request All theses in database
router.get(
  "/theses",
  paginatedData(Thesis),
  convertThesesData(),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

// Request All theses in database
router.get(
  "/theses/:userId",
  paginatedFilteredData(Thesis),
  convertThesesData(),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

// Request All theses requests in database
router.get("/theses_requests", paginatedData(ThesisRequest), (req, res) => {
  try {
    res.json(res.paginatedData);
  } catch (err) {
    res.status(500).json({ message: "Server internal error occurred!" });
  }
});

function convertRequestsData() {
  return async (req, res, next) => {
    try {
      let converted_data = [];

      if (res.paginatedData.results) {
        let index = 0;
        while (res.paginatedData.results[index]) {
          const thesis = await Thesis.findById(
            res.paginatedData.results[index].thesis,
            "title topic area group"
          );
          const student = await User.findById(
            res.paginatedData.results[index].student,
            "email first_name last_name"
          );
          const professor = await User.findById(
            res.paginatedData.results[index].professor,
            "email first_name last_name"
          );

          if (thesis && student && professor) {
            let newObject = {
              _id: res.paginatedData.results[index]._id,
              date: res.paginatedData.results[index].date,
              thesis_id: thesis._id,
              thesis_title: thesis.title,
              thesis_topic: thesis.topic,
              thesis_area: thesis.area,
              thesis_group: thesis.group,
              student_id: student._id,
              student_email: student.email,
              student_name: student.first_name + " " + student.last_name,
              required_files: res.paginatedData.results[index].required_files,
              professor_id: professor._id,
              professor_email: professor.email,
              professor_name: professor.first_name + " " + professor.last_name,
            };

            converted_data.push(newObject);
          }

          index++;
        }

        // console.log("Current Data : ", res.paginatedData.results);
        // console.log("Converted Data : ", converted_data);
        res.paginatedData.results = converted_data;
      }

      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  };
}

// Request User's theses requests in database
router.get(
  "/theses_requests/:userId",
  paginatedFilteredData(ThesisRequest),
  convertRequestsData(),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

//pairnei ws response apo get request data sxetika me assignedTheses kai ta kanei convert
function convertAssignedThesissData() {
  return async (req, res, next) => {
    try {
      let converted_data = [];

      // console.log(res.paginatedData.results)
      if (res.paginatedData.results) {
        let index = 0;
        while (res.paginatedData.results[index]) {
          const thesis = await Thesis.findById(
            res.paginatedData.results[index].thesis,
            "title topic area group"
          );
          const student = await User.findById(
            res.paginatedData.results[index].student,
            "email first_name last_name"
          );
          const professor = await User.findById(
            res.paginatedData.results[index].professor,
            "email first_name last_name"
          );
          
          /*
          const supervisor = await User.findById(
            res.paginatedData.results[index].supervisor,
            "email first_name last_name"
          );*/

          var supervisor=[];
          var newSupervisor;
          for(sup in res.paginatedData.results[index].supervisor){

            newSupervisor = await User.findById(
              res.paginatedData.results[index].supervisor[sup],
              "email first_name last_name"
            );
              
            supervisor.push(newSupervisor)
          }

          let newObject = {
            _id: res.paginatedData.results[index]._id,
            date: res.paginatedData.results[index].date,
            thesis_title: thesis.title,
            thesis_topic: thesis.topic,
            thesis_area: thesis.area,
            thesis_group: thesis.group,
            thesis_status: res.paginatedData.results[index].status,
            thesis_title_greek: res.paginatedData.results[index].title_greek,
            thesis_title_english:
              res.paginatedData.results[index].title_english,
            thesis_grade: res.paginatedData.results[index].grade,
            student_id: student._id,
            student_email: student.email,
            student_name: student.first_name + " " + student.last_name,
            professor_email: professor.email,
            professor_name: professor.first_name + " " + professor.last_name,
            supervisor_email: supervisor.map(element => element ? element.email : null),
            supervisor_name: supervisor.first_name + " " + supervisor.last_name,
            supervisor_id: supervisor.map(element => element ? element.id : null)
          };

          //newObject.supervisor_id = supervisor.map(element => element.id)
          //console.log('oi supervisors:', newObject.supervisor_id)

          // console.log(newObject);
          converted_data.push(newObject);
          index++;
        }
        res.paginatedData.results = converted_data;
      }

      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  };
}

// Request All assigned theses in database
router.get(
  "/assigned_theses",
  paginatedData(AssignedThesis),
  convertAssignedThesissData(),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

// Request User's assigned theses in database
router.get(
  "/assigned_theses/:userId",
  paginatedFilteredData(AssignedThesis),
  convertAssignedThesissData(),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

function convertThesissData() {
  return async (req, res, next) => {
    try {
      let converted_data = {
        date : "",
        thesis : "",
        status : "",
        professor : "",
        supervisor : [],
      };
      //we get the theisis id
      const thesis_assigned = await AssignedThesis.find({
        student: req.params.userId,
      });

      let thesis_data = "";
      if (thesis_assigned[0]) {
        //we get extra thesis data (like title)
        thesis_data = await Thesis.findById(thesis_assigned[0].thesis);

        const professor = await User.findById(thesis_assigned[0].professor);

        //oi supervisors
        //console.log(thesis_assigned[0].supervisor)

        converted_data.date = thesis_assigned[0].date;
        converted_data.thesis = thesis_data;
        converted_data.thesis.status = thesis_assigned[0].status;
        converted_data.thesis.professor = professor.email;
        thesis_assigned[0].supervisor.map((sup) => {converted_data.supervisor.push(sup)}) //ta id twn supervisors
      } else {
        converted_data.thesis = thesis_data;
      }

      res.data = converted_data;
      // console.log(res.data);
      next();
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  };
}

// Request User's thesis
router.get("/my_thesis/:userId", convertThesissData(), (req, res) => {
  try {
    res.json(res.data);
  } catch (err) {
    res.status(500).json({ message: "Server internal error occurred!" });
  }
});

// Request User's report in database
router.get(
  "/reports/:userId",
  paginatedFilteredData(ThesisReport),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);

/*
// Request All notifications in database
router.get("/notifications", paginatedData(Notification), (req, res) => {
  try {
    res.json(res.paginatedData);
  } catch (err) {
    res.status(500).json({ message: "Server internal error occurred!" });
  }
});

// Request User's notifications in database
router.get(
  "/notifications/:userId",
  paginatedFilteredData(Notification),
  (req, res) => {
    try {
      res.json(res.paginatedData);
    } catch (err) {
      res.status(500).json({ message: "Server internal error occurred!" });
    }
  }
);*/

// Return Paginated Data
function paginatedData(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const attr = req.query.attr;
    const filter = req.query.filter;

    if (page <= 0 || limit <= 0) {
      const results = {};
      results.results = {};
      res.paginatedData = results;
      next();
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

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

        filtered_data.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        try {
          results.results = await filtered_data.slice(startIndex, endIndex);
          //console.log(results);
          res.paginatedData = results;
          next();
        } catch (err) {
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
        await model.count({}, function (err, count) {
          // console.log("Number of items:", count);
          results.startIndex = startIndex;
          results.endIndex = endIndex;
          results.total = count;

          res.paginatedData = results;
          next();
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  };
}

// Return Paginated Data filtered by user's ID
function paginatedFilteredData(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const user = req.query.user;
    const userId = req.params.userId;

    const attr = req.query.attr;
    const filter = req.query.filter;

    if (page <= 0 || limit <= 0) {
      const results = {};
      results.results = {};
      res.paginatedData = results;
      next();
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    let filtered_data;
    if (!userId) {
      filtered_data = await model.find({ [attr]: filter });
    } else if (userId && filter === "none") {
      // console.log("UserId: ", userId);
      filtered_data = await model.find({ [user]: userId });
    } else {
      try {
        const temp_data = await model.find({ [user]: userId });
        filtered_data = await temp_data.filter((obj) => obj[attr] === filter);
      } catch (err) {
        console.log(err);
      }
    }

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
    }

    filtered_data.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    try {
      results.results = await filtered_data.slice(startIndex, endIndex);
      //console.log(results);
      res.paginatedData = results;
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

// Return Paginated Data
function paginatedAreaData(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const attr = req.query.attr;
    const filter = req.query.filter;

    console.log("Pagination: ", page, limit);
    if (page <= 0 || limit <= 0) {
      const results = {};
      results.results = {};
      res.paginatedData = results;
      next();
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

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

        filtered_data.sort((a, b) => {
          const result = a["name"].localeCompare(b["name"], "en", {
            sensitivity: "base",
          });
          return result;
        });

        try {
          results.results = await filtered_data.slice(startIndex, endIndex);
          //console.log(results);
          res.paginatedData = results;
          next();
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    } else {
      try {
        await model.countDocuments({}, async function (err, count) {
          // console.log("Number of items:", count);
          if (count < limit && page > 1) {
            results.startIndex = 1;
            results.endIndex = limit;
          } else {
            results.startIndex = startIndex;
            results.endIndex = endIndex;
          }
          results.total = count;
          results.results = await model
          .find()
          .sort("name")
          .limit(limit)
          .skip(startIndex);

          res.paginatedData = results;
          next();
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  };
}

// Verify user's token (authentication)
function verifyToken() {
  return async (req, res, next) => {
    const token = req.body.accessToken;
    if (!token) {
      req.verified = {
        message: "Authentication failed. Access denied!",
        status: 401,
        user: {},
      };
      next();
    }

    try {
      //console.log("Token: ", token);
      const verified = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, verifiedJwt) => {
          if (err) {
            req.verified = {
              message: "Authentication failed. Invalid token!",
              status: 403,
              user: {},
            };
          } else {
            //console.log("Verified JWT: ", verifiedJwt);
            req.verified = {
              message: "Authentication succeeded. User is verified!",
              status: 200,
              user: verifiedJwt,
            };
          }
        }
      );
      next();
    } catch (err) {
      req.verified = {
        message: "Server internal error occurred!",
        status: 500,
        user: {},
      };
      next();
    }
  };
}

module.exports = router;
