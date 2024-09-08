const router = require("express").Router();
const Notification = require("../models/Notification");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const config = require("config");

module.exports = function (io) {
  //for user-socket.id mapping
  var users = {};

  io.on("connection", (socket) => {
    //current connection's user id
    var currentUserId;

    //-----SOCKET EVENTS-----

    //map user with socketid
    socket.on("map", (userId) => {
      currentUserId = userId;
      users[socket.id] = userId;
      console.log(userId, " connected");
    });

    //disconnect
    socket.on("disconnect", () => {
      delete users[socket.id]; //remove from mapping
      console.log(socket.id, " disconnected.");
    });

    //--------ROUTERS and FUNCTIONS------------
    async function sendEmail(receiverId, title, message) {
      const receiver = await User.findOne({ _id: receiverId });
      const receiverEmail = receiver.email;

      //apo config file
      const senderEmail = config.get("AdminMailCredentials.email");
      const senderPswd = config.get("AdminMailCredentials.password");
      const senderService = config.get("AdminMailCredentials.service");

      //prevent error
      if (
        senderEmail.length === 0 ||
        senderPswd.length === 0 ||
        senderService.length === 0
      ) {
        return;
      } else {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          service: senderService,
          auth: {
            user: senderEmail,
            pass: senderPswd,
          },
          tls: { rejectUnauthorized: false },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: senderEmail,
          to: receiverEmail, //receiver email
          subject: title,
          text: message,
          html: "<b>" + message + "</b>",
        });

        console.log("Mail sent successfully!");
      }
    }

    // New Notification
    router.post("/", async (req, res) => {
      // Create a new Notification
      try {
        const notification = new Notification({
          title: req.body.title,
          message: req.body.message,
          receiver: req.body.receiver,
          type: req.body.type,
          date: Date.now(),
        });

        const saved_notification = await notification.save();
        res.send({ notification: notification._id });

        var receiverSocketIds = [];

        //we get all the current socketIds of the receiver and the sender
        Object.keys(users).forEach((key) => {
          //key is the socket.id of the receiver

          //for receiver
          if (users[key] === notification.receiver) {
            receiverSocketIds.push(key);
          }
        });

        console.log("receivers: ", receiverSocketIds, "users: ", users);

        //emit to all of the receiver sockets
        if (receiverSocketIds.length > 0) {
          receiverSocketIds.forEach((socketId) => {
            socket.to(socketId).emit("newNotification");
          });
        }

        sendEmail(req.body.receiver, req.body.title, req.body.message);
      } catch (err) {
        console.log(err);
        res.status(400).send(err);
      }
    });

    // Update notification status
    router.patch("/:notificationId", async (req, res) => {
      const updated_notification = await Notification.updateOne(
        { _id: req.params.notificationId },
        { $set: { [req.body.attr]: req.body.value } },
      )
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          console.log("Server internal error occurred!");
        });
    });

    // Request ALL User's notifications in database
    router.get("/all/:userId", async (req, res) => {
      await Notification.find({ receiver: req.params.userId })
        .sort({ date: -1 })
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          console.log("Server internal error occurred!");
        });
    });

    // Request last 20 notifications of a User in database
    router.get("/some/:userId", async (req, res) => {
      await Notification.find({ receiver: req.params.userId })
        .sort({ date: -1 })
        .limit(20)
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          console.log("Server internal error occurred!");
        });
    });
  });

  return router;
};
