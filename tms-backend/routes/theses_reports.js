const router = require("express").Router();
const ThesisReport = require("../models/ThesisReport");

// New Thesis Report
router.post("/", async (req, res) => {
  // Create a new Thesis Report
  try {
    const report = new ThesisReport({
        title: req.body.title,
        description: req.body.description,
        isFinal: req.body.isFinal,
        student: req.body.userId,
        report_files: req.body.report_files,
        date: Date.now()
    });

    const saved_report = await report.save();
    res.send({ report: report._id });
  } catch (err) {
    // console.log(err);
    res.status(400).send(err);
  }
});

//Add comment
router.patch("/addComment/:reportId", async (req, res) => {
  const updated_report = await ThesisReport.updateOne(
    { _id: req.params.reportId },
    { $push: { [req.body.attr]: req.body.value }
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
      res.status(500).send(err);
    });
});

module.exports = router;
