const router = require("express").Router();
const fs = require("fs");
const ThesisRequest = require("../models/ThesisRequest");
const Thesis = require("../models/Thesis");
const { json } = require("express/lib/response");

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

  const today_date = now.getDate();
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
  timers.reset_date.map((date) => {
    const timer_date = date.split(" ")[0];
    const timer_month = date.split(" ")[1];

    if (
      parseInt(timer_date) === parseInt(today_date) &&
      timer_month === today_month
    ) {
      // Deleting all requests with status declined! We could store them in different document of file if necessary.
      // Another way of filtering: We could search every 't' minutes for declined requests and delete the ones with
      // date more than 'n' months from Date.now

      // Save Declined
      console.log("Saving declined requests..");
      ThesisRequest.find({ status: "declined" })
        .then((requests) => {
          // console.log(requests);
          if (requests.length > 0) {
            // If file becomes over 'n' MBytes we should delete the file or save data in a database engine
            const data = fs.readFileSync("public/declined_requests.txt", {
              encoding: "utf8",
              flag: "r",
            });

            // convert to json
            json = JSON.parse(data);
            // push current declined requests
            requests.map((request) => {
              json.requests.push(request); 
            })
            
            // convert to string
            const str_data = JSON.stringify(json);
            console.log(str_data);
            // write back to file
            fs.writeFileSync("public/declined_requests.txt", str_data, {flag:"w+"});
          }
        })
        .catch((err) => {
          console.log(err);
        });

      // console.log("Deleting declined requests..");
      // Delete Declined Requests
      ThesisRequest.deleteMany({ status: "declined" })
        .then(() => {
          console.log("Requests deleted!");
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
}, 43200000); // check every 12 hours
// 600000 10 minutes
// 3600000 1 hour
// 43200000 12 hours

// New Thesis Request
router.post("/", async (req, res) => {
  // Create a new Thesis Request
  try {
    const thesis = await Thesis.find({ _id: req.body.thesis });
    let professor = "";
    if (thesis[0]) {
      professor = thesis[0].professor;
    } else {
      throw "An error occurred: Thesis not found in database!";
    }

    const thesis_request = new ThesisRequest({
      thesis: req.body.thesis,
      student: req.body.student,
      professor: professor,
      required_files: req.body.required_files,
      date: Date.now(),
    });

    const saved_thesis_request = await thesis_request.save();
    res.send({ thesis_request: thesis_request._id });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Update thesis request
router.patch("/:requestId", async (req, res) => {
  const updated_request = await ThesisRequest.updateOne(
    { _id: req.params.requestId },
    { $set: { status: req.body.status } }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

//reapply files
router.patch("/reapply/:requestId", async (req, res) => {
  console.log("Id: ", req.params.requestId)
  console.log("Files: ", req.body.files)
  const updated_request = await ThesisRequest.updateOne(
    { _id: req.params.requestId },
    { $set: { required_files: req.body.files } }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

//get all theses requests of a student
router.get("/student/:userId", async (req, res) => {
  const student_requests = await ThesisRequest.find(
    { student: req.params.userId }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

module.exports = router;
