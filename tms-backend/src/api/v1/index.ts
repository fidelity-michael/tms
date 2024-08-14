// TODO: Use correct routes
import * as express from "express";
// import { EventController } from './companion-event/companion_event.controller';
// import { ExampleController } from './example/example.controller';
// import { ItemShopController } from './item-shop/item-shop.controller';
// import { LabelController } from './labels/labels.controller';
// import { PersonController } from './people/people.controller';
import { ResourcesController } from "./resources/resources-controller";
import { AreaController } from "./area/area-controller";
import { NotificationController } from "./notifications/notif-controller";
import { rateLimit } from "express-rate-limit";

import { config } from "../../config/environment";
import { UserController } from "./users/user-controller";
// import { TaskController } from './task/task.controller';

const apiLimiter = rateLimit(config.apiLimiter);
// const authLimiter = rateLimit(config.authLimiter);
const notificationsLimiter = rateLimit(config.notifLimiter);
const chatLimiter = rateLimit(config.chatLimiter)

const apiV1Router = express.Router();
const notificationV1Router = express.Router();
const chatV1Router = express.Router();

apiV1Router
  .use("/resource", apiLimiter, new ResourcesController().applyRoutes())
  .use("/areas", apiLimiter, new AreaController().applyRoutes())
  .use("/users", apiLimiter, new UserController().applyRoutes());

notificationV1Router.use(
  "/",
  notificationsLimiter,
  new NotificationController().applyRoutes(),
);

// TODO: Add chat route
// chatV1Router.use(
//   "/",
//   chatLimiter,
//
 // )

export { apiV1Router, notificationV1Router };
