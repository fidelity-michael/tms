const router = require("express").Router();
const Message = require("../models/Message");
const CryptoJS = require("crypto-js");


// New Message
router.post("/", async (req, res) => {
    try {
        var newMessage = new Message({
          sender: req.body.sender,
          chatId: req.body.chatId,
          text: req.body.text, 
          read: [],
          date: Date.now()
        });

        //encrypt the message
        newMessage.text = CryptoJS.AES.encrypt(newMessage.text, process.env.AES_KEY).toString();
    
        const savedMessage = await newMessage.save();
        res.send(savedMessage);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
});

// Get a message data by its id
router.get("/data/:messageId", async (req, res) => {
  const message = await Message.find({_id: req.params.messageId})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred! get message data");
    });
});

// Get all messages of private conversation
router.get("/:chatId", async (req, res) => {
  const messages = await Message.find({chatId: req.params.chatId})
    .then((data) => {

      //decrypt the message
      data.map((message) => {
        var decrypted = CryptoJS.AES.decrypt(message.text, process.env.AES_KEY);
        message.text = decrypted.toString(CryptoJS.enc.Utf8);
      })
      
      res.json(data)
    })
    .catch((err) => {
      console.log("Server internal error occurred get all messaes!");
    });
});


//mark message as read by a user
router.patch("/read/:messageId", async (req, res) => {
  
  const read = await Message.updateOne(
    { _id: req.params.messageId },
    { $push: { read: req.body.userId }
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("Server internal error occurred read!", err);
      });
});

//add file to message
router.patch("/addFiles/:messageId", async (req, res) => {
  console.log('aaaaaaaaaa', req.body.fileNames)
  const addFile = await Message.updateOne(
    { _id: req.params.messageId },
    { $set: { files: req.body.fileNames }
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("Server internal error occurred read!", err);
      });
});



module.exports = router;