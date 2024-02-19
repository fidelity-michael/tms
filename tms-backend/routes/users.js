const router = require("express").Router();
const bcrypt = require("bcryptJS");
const User = require("../models/User");

const { registerValidation } = require("../auth/validation");

const encryptPass = async (plainPass, rounds) => {
  const saltRounds = await bcrypt.genSalt(rounds);
  const hashedPass = await bcrypt.hash(plainPass, saltRounds);
  return hashedPass;
};

const initUsers = async () => {
  User.insertMany([
    {
      email: "student@csd.uoc.gr",
      password: await encryptPass("student", 10),
      role: "student",
      group: "BSc",
      department: "5f89b089099c8d21dc2d9ef8",
    },
    {
      email: "professor@csd.uoc.gr",
      password: await encryptPass("professor", 10),
      role: "professor",
      group: "Professor",
      department: "5f89b089099c8d21dc2d9ef8",
    },
    {
      email: "secretariat@csd.uoc.gr",
      password: await encryptPass("secretariat", 10),
      role: "secretariat",
      group: "Secretariat",
      department: "5f89b089099c8d21dc2d9ef8",
    },
    {
      email: "admin@csd.uoc.gr",
      password: await encryptPass("admin", 10),
      role: "administrator",
      group: "Administrator",
      department: "5f89b089099c8d21dc2d9ef8",
    },
  ])
    .then(() => {
      console.log("Users initialized successfully!");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Check if Model is empty, if empty initialize document
User.findOne({}, function (err, docs) {
  if (err) {
    console.log(err);
  } else if (!docs) {
    initUsers();
  }
});

// Register users (Mostly for testing)
router.post("/", async (req, res) => {
  // Validate data before add a new user
  // const { error, value } = registerValidation(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  // Check if user email already exists in the database
  const user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .send({ message: "User already exists in database!" });

  // Hash passwords
  const saltRounds = await bcrypt.genSalt(10);
  const plainPass = req.body.password;
  const hashedPass = await bcrypt.hash(plainPass, saltRounds);

  // Create a new User
  try {
    const user = new User({
      first_name: req.body.first_name ? req.body.first_name : "FirstName",
      last_name: req.body.last_name ? req.body.last_name : "LastName",
      email: req.body.email,
      password: hashedPass,
      role: req.body.role,
      group: req.body.group
      // thesis: req.body.thesis,
    });

    const saved_user = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Remove user
router.delete("/:userId", async (req, res) => {
  removed_user = await User.remove({ _id: req.params.userId })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("Server internal error occurred!");
      res.status(500).send(err);
    });
});

// Update user
router.patch("/:userId", async (req, res) => {
  const updated_user = await User.updateOne(
    { _id: req.params.userId },
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
