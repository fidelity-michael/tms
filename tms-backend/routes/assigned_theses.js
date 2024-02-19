const router = require("express").Router();
const fs = require("fs");

const AssignedThesis = require("../models/AssignedThesis");
const Notification = require("../models/Notification");
const User = require("../models/User");


// New Assigned Thesis
router.post("/", async (req, res) => {
  // Create a new Assigned Thesis
  try {
    const assigned_thesis = new AssignedThesis({
      thesis: req.body.thesis,
      professor: req.body.professor,
      supervisor: req.body.supervisor,
      student: req.body.student,
      date: Date.now(),
    });

    const saved_assigned_thesis = await assigned_thesis.save();
    res.send({ assigned_thesis: assigned_thesis._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update Assigned Thesis
router.patch("/:userId", async (req, res) => {
  const updated_assigned_thesis = await AssignedThesis.updateOne(
    { student: req.params.userId },
    { $set: { [req.body.attr]: req.body.value } }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

//get all assigned theses
router.get("/", async (req, res) => {
  const assigned_theses = await AssignedThesis.find()
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    console.log("Server internal error occurred!");
  });
})

//get user's thesis info
router.get("/assigned_thesis/:userId", async (req, res) => {
  const assigned_thesis = await AssignedThesis.findOne( 
    { student: req.params.userId }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

//get a professor's supervised theses info
router.get("/supervised/:userId", async (req, res) => {
  const assigned_thesis = await AssignedThesis.find( 
    { supervisor: {$elemMatch: {$eq: req.params.userId} }  }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

router.patch("/thesis/:userId", async (req, res) => {
  const updated_assigned_thesis = await AssignedThesis.findOneAndUpdate(
    { student: req.params.userId },
    {
      $set: {
        title_greek: req.body.title_greek,
        title_english: req.body.title_english,
        grade: req.body.grade,
      },
    }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

//update an assigned thesis attribute
router.patch("/updateAttribute/:thesisId", async(req, res) => {
  const updatedAssignedThesis = await AssignedThesis.updateOne(
    { _id: req.params.thesisId },
    { $set: { [req.body.attr]: req.body.value } }
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Remove Assigned Thesis with param the thesis
router.delete("/:thesisId", async (req, res) => {
  removed_thesis = await AssignedThesis.remove({ _id: req.params.thesisId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
      res.status(500).send(err);
    });
});

// Remove Assigned Thesis with assigned thesis id as param
router.delete("/delete/:assignedThesisId", async (req, res) => {
  removed_thesis = await AssignedThesis.remove({ _id: req.params.assignedThesisId })
    .then((data) => {
      console.log('thesis removed: ', req.params.assignedThesisId)
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
      res.status(500).send(err);
    });
});

module.exports = router;
