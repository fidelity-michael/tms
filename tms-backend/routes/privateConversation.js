const router = require("express").Router();
const PrivateConversation = require("../models/PrivateConversation");

// New Private Conversation
router.post("/", async (req, res) => {
    
    try {
        const newPrivateConvo = new PrivateConversation({
          user1: req.body.user1,
          user2: req.body.user2,
          date: Date.now()
        });
    
        const savedConvo = await newPrivateConvo.save();
        res.send(newPrivateConvo);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
});

// Get all private conversations of a user
router.get("/:userId", async (req, res) => {
    const conversation = await PrivateConversation.find( { $or: [ {user1: req.params.userId}, {user2: req.params.userId} ] } )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
});

//update a conversation's lastMessage property
router.patch("/updateLastMessage/:chatId", async (req, res) => {
  var lastMessage = req.body.lastMessage;
  delete lastMessage.text; //exclude text
  
  const newDate = await PrivateConversation.updateOne(
    { _id: req.params.chatId },
    { $set: { lastMessage: lastMessage }}
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
})

//update a conversation's lastMessage as read property
router.patch("/readLastMessage/:chatId", async (req, res) => {
  const newDate = await PrivateConversation.updateOne(
    { _id: req.params.chatId },
    { $push: { "lastMessage.read": req.body.userId }}
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
    });
})

module.exports = router;