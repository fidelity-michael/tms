const router = require("express").Router();
const University = require("../models/University");

const initUniversities = () => {
  University.insertMany([
    { name: "University of Crete", country: "Greece" }
  ])
    .then(() => {
      console.log("Universities initialized successfully!");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Check if Model is empty, if empty initialize document
University.findOne({}, function (err, docs) {
  if(err) {
    console.log(err);
  }
  else if (!docs) {
    initUniversities();
  }
});

// New University
router.post("/", async (req, res) => {
  // Create a new University
  try {
    const university = new University({
      name: req.body.name,
      country: req.body.country,
    });

    const saved_university = await university.save();
    res.send({ university: university._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get all universities
router.get("/", async (req, res) => {
  await University.find()
  .then((data) => res.json(data))
  .catch((err) => console.log("Server Internal error occured!"))
})

//Edit University
router.patch("/:id", async (req, res) => {
  console.log(req. body.name, req.body.country)
    const updated_university = await University.updateOne(
      {_id: req.params.id},
      {$set: 
        {
          name: req.body.name,
          country: req.body.country
        }
      }
    )
    .then((data) => res.json(data))
    .catch((err) => console.log("Server Internal error occured!"))
})

// Remove university
router.delete("/:universityId", async (req, res) => {
  removed_university = await University.remove({ _id: req.params.universityId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

module.exports = router;