const router = require("express").Router();
const CalendarEvent = require("../models/CalendarEvent");

// New Calendar Event
router.post("/", async (req, res) => {
    try {
      const event = new CalendarEvent({
          userId: req.body.userId,
          title: req.body.title,
          date: req.body.date
      });

  
      const savedEvent = await event.save();
      res.send({ title: event._id });
    } catch (err) {
      // console.log(err);
      res.status(400).send(err);
    }
});

//get all calendar events of a user
router.get("/:userId", async (req, res) => {
    const events = await CalendarEvent.find({userId: req.params.userId})
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("Server internal error occurred! get message data");
      });
});

//delete

module.exports = router;