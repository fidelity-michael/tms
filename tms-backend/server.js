// Import npm packages
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("morgan");
const fileUpload = require('express-fileupload');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

var session = require("express-session")({
  
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    rolling: true, //the session identifier cookie will expire in maxAge since the last response was sent
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE), 
    }
    
});

//limiters for ddos attack prevention
const apiLimiter = rateLimit({
  windowMs: 3*60*1000,    // 3 minutes
  max: 300,               // limit each IP to 300 requests per windowMs (for each route)
  message: "Too many requests!"
});
//for auth route (login/logout ktlp ) ddos and brute force prevention
const authLimiter = rateLimit({
  windowMs: 1*60*1000,    // 1 minute
  max: 10,               // limit each IP to 10 requests per windowMs (for auth route)
  message: "Too many requests!"
});

// Import Routes
const apiRoute = require("./routes/api");
const authRoute = require("./routes/auth");
const universitiesRoute = require("./routes/universities");
const departmentsRoute = require("./routes/departments");
const areasRoute = require("./routes/areas");
const usersRoute = require("./routes/users");
const thesesRoute = require("./routes/theses");
const favouritesRoute = require("./routes/favourites");
const theses_requestsRoute = require("./routes/theses_requests");
const assigned_thesesRoute = require("./routes/assigned_theses");
const theses_reportsRoute = require("./routes/theses_reports");
const calendarEventsRoute = require("./routes/calendarEvents");

const app = express();
const PORT = 4001;

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

// Session Cookie
app.use(session);

//listen to port
app.listen(PORT, console.log(`Server is starting at ${PORT}`));

// Routes
app.use("/api", apiLimiter, apiRoute);
app.use("/auth", authLimiter, authRoute);
app.use("/universities", apiLimiter, universitiesRoute);
app.use("/departments", apiLimiter, departmentsRoute);
app.use("/areas", apiLimiter, areasRoute);
app.use("/users", apiLimiter, usersRoute);
app.use("/theses", apiLimiter, thesesRoute);
app.use("/favourites", apiLimiter, favouritesRoute);
app.use("/theses_requests", apiLimiter, theses_requestsRoute);
app.use("/assigned_theses", apiLimiter, assigned_thesesRoute);
app.use("/theses_reports", apiLimiter, theses_reportsRoute);
app.use("/calendarEvents", apiLimiter, calendarEventsRoute);
