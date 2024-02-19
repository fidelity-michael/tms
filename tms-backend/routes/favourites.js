const router = require("express").Router();
const Favourite = require("../models/Favourite");

// New Favourite
router.post("/", async (req, res) => {
  // Create a new Favourite
  try {
    const favourite = new Favourite({
      student: req.body.student,
      area_id: req.body.area_id,
      area_name: req.body.area_name
    });

    const saved_favourite = await favourite.save();
    res.send({ favourite: favourite._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

// get all favourites of an area
router.get("/:area", async (req, res) => {
  await Favourite.find( 
    { area_name: req.params.area}
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

// Remove Favourite
router.delete("/", async (req, res) => {
  const find_favourite = await Favourite.findOne({
    student: req.query.student,
    area_id: req.query.area_id,
  })
    .then((data) => {
      const removed_favourite = Favourite.remove({ _id: data._id })
        .then((data) => {
          // console.log("Area deleted from favourites!");
          res.json(data);
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    })
    .catch((err) => {
      res.status(500).send(err);
    });  
});

module.exports = router;
