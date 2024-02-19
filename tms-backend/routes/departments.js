const router = require("express").Router();
const Department = require("../models/Department");

const initDepartments = () => {
  Department.insertMany([
    { 
      name: "Computer Science Department", 
      university: "University of Crete",
      phone: "+30 281 039 3504",
      email: "csd@csd.uoc.gr"
    }
  ])
    .then(() => {
      console.log("Departments initialized successfully!");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Check if Model is empty, if empty initialize document
Department.findOne({}, function (err, docs) {
  if(err) {
    console.log(err);
  }
  else if (!docs) {
    initDepartments();
  }
});

// New Department
router.post("/", async (req, res) => {
  // Create a new Department
  try {
    const department = new Department({
      name: req.body.name,
      university: req.body.university,
      phone: req.body.phone,
      email: req.body.email,
    });

    const saved_department = await department.save();
    res.send({ department: department._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", async (req, res) => {
  await Department.find()
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    console.log("Server internal error occurred!")
  });
})

//Edit Department
router.patch("/:id", async (req, res) => {
  console.log(req. body.name, req.body.country)
    const updated_department = await Department.updateOne(
      {_id: req.params.id},
      {$set: 
        {
          name: req.body.name,
          university: req.body.university,
          email: req.body.email,
          phone: req.body.phone
        }
      }
    )
    .then((data) => res.json(data))
    .catch((err) => console.log("Server Internal error occured!"))
})

// Remove department
router.delete("/:departmentId", async (req, res) => {
  removed_department = await Department.remove({ _id: req.params.departmentId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

module.exports = router;