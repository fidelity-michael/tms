const router = require("express").Router();
const Thesis = require("../models/Thesis");

// New Thesis
router.post("/", async (req, res) => {
  // Create a new Thesis
  try {
    const thesis = new Thesis({
      title: req.body.title,
      topic: req.body.topic,
      area: req.body.area,
      prerequisites: req.body.prerequisites,
      description: req.body.description,
      group: req.body.group,
      professor: req.body.professor,
      required_files: req.body.required_files,
      thesis_files: req.body.thesis_files,
      date: Date.now()
    });

    // console.log(thesis);
    const saved_thesis = await thesis.save();
    res.send({ thesis: thesis._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:thesisId", async (req, res) => {
  await Thesis.find({_id: req.params.thesisId})
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    console.log("Server internal error occurred! get message data");
  });
})


// Remove thesis
router.delete("/:thesisId", async (req, res) => {
  removed_thesis = await Thesis.remove({ _id: req.params.thesisId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Update thesis
router.patch("/:thesisId", async (req, res) => {
  const updated_thesis = await Thesis.updateOne(
    { _id: req.params.thesisId },
    { $set: { [req.body.attr]: req.body.value }
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

module.exports = router;