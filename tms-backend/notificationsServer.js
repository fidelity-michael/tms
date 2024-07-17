// Import npm packages
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("morgan");
const fileUpload = require('express-fileupload');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

//limiter for ddos attack prevention
const notificationsLimiter = rateLimit({
  windowMs: 3*60*1000,    // 5 minutes
  max: 500,               // limit each IP to 500 requests per windowMs
  message: "Too many requests!"
});

// Import Routes
const notificationsRoute = require("./routes/notifications");
const { functions } = require("lodash");

const app = express();
const PORT = 4000;

// Connect to DB locally
const connection = mongoose.connect("mongodb://localhost/tms", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection.then(
  () => {console.log('Mongoose is connected to database!')},
  err => {console.log("Mongoose: ", err);}
);

//security
app.use(helmet());

// > In order to fix internal server error (XMLHttpRequest has been blocked by CORS policy)
// Sol1: app.use(cors());
// Sol2: use backend server as proxy for frontend server in package.json
// > EJS to generate html with javascript
// > app.use(bodyParser.json());

app.use(express.json());

// HTTP request logger
app.use(logger("tiny"));

// Init fileUpload
app.use(fileUpload());

//listen to port
let server = app.listen(PORT, console.log(`Notification server is starting at ${PORT}`));

//in order to pass socket io to chatRoute and bypass cors error
const io = require('socket.io')(server, {
  cors:{
    origin: "*" //["http://localhost:3000"]
  }
});


// Routes
app.use("/notifications", notificationsLimiter, notificationsRoute(io));
