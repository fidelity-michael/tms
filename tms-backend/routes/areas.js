const router = require("express").Router();
const Area = require("../models/Area");

const initAreas = () => {
  Area.insertMany([
    { name: "Computer Hardware" },
    { name: "Computer Networking" },
    { name: "Computer Software" },
    { name: "Cloud computing" },
    { name: "Cyber Security and Ethical Hacking" },
    { name: "Data Science and Data Analysis" },
    { name: "Programming Language" },
    { name: "Micro Architecture" },
    { name: "Operating system" },
    { name: "Web Development" },
    { name: "Web Designing" },
    { name: "Graphics design" },
    { name: "Network Analytics and testing" },
    { name: "Robotics" },
    { name: "Artificial intelligence" },
    { name: "Computer Aided Design drafter" },
    { name: "Data Entry Operator" },
    { name: "DataBase management system" },
    { name: "Video Game Designer" },
    { name: "Computer Architecture and Engineering" },
    { name: "UI designer" },
    { name: "Computer Animation and 3D design" },
    { name: "Computer vfx" },
    { name: "Motion graphics and Visual Effects" },
    { name: "Computer Biosystem" },
    { name: "Numeric analysis" },
    { name: "Cryptography" },
    { name: "Research and development" },
    { name: "Traffic control system" },
    { name: "Mobile Application Development" },
    { name: "Computer Accounting" },
    { name: "User Experience design" },
    { name: "SEO" },
    { name: "Digital Marketing" },
    { name: "Business Management" },
    { name: "Stenographer and typist" },
    { name: "Clinical image processing" },
    { name: "Medical Record Technology" },
    { name: "Video editing and compositing" }
  ])
    .then(() => {
      console.log("Areas initialized successfully!");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Check if Model is empty, if empty initialize document
Area.findOne({}, function (err, docs) {
  if(err) {
    console.log(err);
  }
  else if (!docs) {
    initAreas();
  }
});

// New Area
router.post("/", async (req, res) => {
  // Create a new Area
  try {
    let area = null;
    
    if(req.body.description.length > 0) {
      area = new Area({
        name: req.body.area_name,
        description: req.body.description,
      });
    }
    else {
      area = new Area({
        name: req.body.area_name,
        description: "No Description",
      });
    }

    const saved_area = await area.save();
    res.send({ area: area._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Remove Area
router.delete("/:areaId", async (req, res) => {
  removed_area = await Area.remove({ _id: req.params.areaId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Update Area
router.patch("/:areaId", async (req, res) => {
  const updated_area = await Area.updateOne(
    { _id: req.params.areaId },
    { $set: { [req.body.attr]: req.body.value }
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
