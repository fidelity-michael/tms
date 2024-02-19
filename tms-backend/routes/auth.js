const router = require("express").Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptJS");
const jwt = require("jsonwebtoken");
// const ldapjs = require("ldapjs"); // Didn't work as expected! (Much more complicated)
const LdapClient = require("ldapjs-client");
const fs = require("fs");

const User = require("../models/User");
const { boolean } = require("@hapi/joi");
const { loginValidation } = require("../auth/validation");
const { stringify } = require("querystring");

const encryptPass = async (plainPass, rounds) => {
  const saltRounds = await bcrypt.genSalt(rounds);
  const hashedPass = await bcrypt.hash(plainPass, saltRounds);
  return hashedPass;
};

const client = new LdapClient({
  url: "ldap://ds.uoc.gr:389"
})

//search user in ldap
function ldapSearch() {
  return async (req, res, next) => {
    try {
      const email = req.body.email;
      const searchOptions = {
        filter: "(mail=" + email + ")",
        scope: "sub",
        attributes: ["cn", "mail", "eduPersonAffiliation", "businessCategory"],
      };

      const baseDN = "ou=csd,dc=uoc,dc=gr";
      const entries = await client.search(baseDN, searchOptions).catch(err => {
        console.log("LDAP connection error occurred! Please check your VPN connection.");
        res.data = { };
        next();
      });
      
      // console.log("Search Data (sent): ", entries);
      res.data = entries;     
      next();
    } catch (err) {
      console.log("Server internal error occurred: ", err);
      res.status(500).json({ message: err.message });
      next();
    }
  };
}

function ldapAuthenticate() {
  return async (req, res, next) => {
    try {
      if (Object.keys(res.data).length === 0) {
        // console.log("LDAP user not found!");
        res.results = {
          auth: "fail",
          message: "LDAP user not found!",
        };
        next();
      } else {
        // console.log("Authenticate Data (received): ", res.data);
        const password = req.body.password;
        const dn = res.data[0].dn;
        // console.log("User dn: ", dn);
        try {
          await client.bind(dn, password);
          // console.log("LDAP Bind succeeded!");
          res.results = {
            auth: "success",
            message: "LDAP authentication succeeded!",
          };
        } catch (e) {
          // console.log("LDAP Bind failed: ", e);
          res.results = {
            auth: "fail",
            message: "LDAP authentication failed!",
          };
        }
        next();
      }
    } catch (err) {
      console.log("Server internal error occurred: ", err);
      res.status(500).json({ message: err.message });
      next();
    }
  };
}

function modifyData() {
  return async (req, res, next) => {
    try {
      // if(res.results.auth === "fail") {
      //   res.status(400).send(res.results);
      // }
      // else {
      //  User Authenticated
      // }

      // console.log("Modify Results: ", res.results);
      if (res.data[0]) {
        console.log("User Entry: ", res.data[0]);
        const role = res.data[0].eduPersonAffiliation
          ? res.data[0].eduPersonAffiliation.toLowerCase()
          : "undefined";

        // console.log("User Role: ", role);
        if (role === "faculty") {
          res.results.role = "professor";
          res.results.group = "Professor";
          res.results.email = res.data[0].mail;
        } else if (role === "student") {
          const group = res.data[0].businessCategory.toLowerCase();
          res.results.role = "student";
          res.results.group =
            group === "ugrad"
              ? "BSc"
              : group === "msc"
              ? "MSc"
              : group === "phd"
              ? "PhD"
              : "undefined";
          res.results.email = res.data[0].mail;
        } else {
          // console.log("Reading staff file..");
          // Read staff.json file
          const data = fs.readFileSync("public/staff.json", {
            encoding: "utf8",
            flag: "r",
          });

          const users = JSON.parse(data);
          if (users) {
            let find_user = users["administrator"].find(
              (user) => user.email === res.data[0].mail
            );

            if (!find_user) {
              find_user = users["secretariat"].find(
                (user) => user.email === res.data[0].mail
              );
              if (!find_user) {
                find_user = users["professor"].find(
                  (user) => user.email === res.data[0].mail
                );
              }
            }

            if (find_user) {
              // console.log("User found: ", find_user);
              res.results.role = find_user.role;
              res.results.group = find_user.group;
              res.results.email = find_user.email;
            } else {
              // console.log("User not found!");
              res.results.auth = "fail";
              res.results.message = "User not found!";
            }
          } else {
            console.log("Staff file is empty!");
            res.results.auth = "fail";
            res.results.message = "User not found!";
          }
        }
      } else {
        res.results.auth = "fail";
        res.results.message = "LDAP user not found!";
      }

      next();
    } catch (err) {
      console.log("Server internal error occurred: ", err);
      res.status(500).json({ message: err.message });
      next();
    }
  };
}

// Login using LDAP client
router.post(
  "/ldap_login",
  ldapSearch(),
  ldapAuthenticate(),
  modifyData(),
  async (req, res) => {
    try {
      if (res.results.auth === "fail") {
        console.log("User Results (FAIL): ", res.results);
        return res.status(400).json(res.results);
      } else {
        console.log("User Results (SUCCESS): ", res.results);
        const user = await User.findOne({ email: res.results.email });
        if (user) {
          console.log("User found in database: ", user);
          // Create and assign token
          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "4h" }
          );

          const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET
          );

          // Create user session
          req.session.user = {
            id: user._id,
            role: user.role,
            group: user.group,
            email: user.email,
          };

          // Send back token and user's role
          const server_res = {
            message: "Authentication successful!",
            accessToken: accessToken,
            role: user.role[0],  //epeidh pleon exoume pollous rolous. sundeomaste me ton prwto
          };

          res.header("Access-Token", accessToken).send(server_res);
        } else {
          console.log("User not found in database!");
          try {
            const insertUser = async () => {
              User.create({
                first_name: res.data[0].cn.split(" ")[0],
                last_name: res.data[0].cn.split(" ")[1],
                email: res.data[0].mail,
                password: await encryptPass(req.body.password, 10),
                role: res.results.role,
                group: res.results.group,
                department: "5f89b089099c8d21dc2d9ef8",
              })
                .then((user) => {
                  console.log("New User inserted: ", user);
                  // Create and assign token
                  const accessToken = jwt.sign(
                    { _id: user._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "4h" }
                  );

                  const refreshToken = jwt.sign(
                    { _id: user._id },
                    process.env.REFRESH_TOKEN_SECRET
                  );

                  // Create user session
                  req.session.user = {
                    id: user._id,
                    role: user.role,
                    group: user.group,
                    email: user.email,
                  };

                  // Send back token and user's role
                  const server_res = {
                    message: "Authentication successful!",
                    accessToken: accessToken,
                    role: user.role,
                  };

                  res.header("Access-Token", accessToken).send(server_res);
                })
                .catch((err) => {
                  console.log("Server internal error occurred: ", err);
                  return res
                    .status(500)
                    .send("Server internal error occurred: ", err);
                });
            };

            insertUser();
          } catch (err) {
            console.log("Server internal error occurred: ", err);
            return res
              .status(500)
              .send("Server internal error occurred: ", err);
          }
        }
      }
    } catch (err) {
      res.status(500).send("Server internal error occurred!", err);
    }
  }
);

// Login to Web App as tst user (not ldap)
router.post("/login", async (req, res) => {
  mongoose.connection.on("error", (err) => {
    console.log("MongoDB failed to connect!");
    res.status(503).send(err);
  });

  // Validate data before add a new user
  // const { error, value } = loginValidation(req.body);
  // if (error) {
  //   const server_res = {
  //     message: error.details[0].message,
  //   };

  //   return res.status(400).send(server_res);
  // }

  // Check if user email exists in the database
  const user = await User.findOne({ email: req.body.email }).catch(err => {
    return res.status(500).send("Server failed to connect with database.");
  });

  if (!user) {
    const server_res = {
      message: "User not registered in database!",
    };

    return res.status(400).send(server_res);
  }

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    const server_res = {
      message: "User password is incorrect!",
    };

    return res.status(400).send(server_res);
  }

  // Create and assign token
  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "4h" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET
  );

  // Create user session
  req.session.user = {
    id: user._id,
    role: user.role,
    group: user.group,
    email: user.email,
  };

  // Send back token and user's role
  const server_res = {
    message: "Authentication successful!",
    accessToken: accessToken,
    role: user.role[0],  //giati pleon exoumme pollous rolous. opote sundeomaste me ton prwto
  };

  res.header("Access-Token", accessToken).send(server_res);
});

router.post("/logout", async (req, res) => {
  req.session.destroy(function (err) {
    if (err) res.status(500).send("Server failed to delete session!");
    else {
      res.send("Server deleted session successfully!");
    }
  });
});

// User authorization
router.get("/authorization", async (req, res) => {
  
  if (req.session.user) {

    const server_res = {
      id: req.session.user.id,
      role: req.session.user.role,
      group: req.session.user.group,
      email: req.session.user.email,
      message: "User is signed in!",
      auth: true,
    };

    res.json(server_res);
  } else {
    
    const server_res = {
      message: "User is not authorized! Please sing in.",
      auth: false,
    };

    res.json(server_res);
  }
});


module.exports = router;
