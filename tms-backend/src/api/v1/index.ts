// TODO: Use correct routes
import * as express from "express";
import { ResourcesController } from "./resources/resources-controller";
import { AreaController } from "./area/area-controller";
import { NotificationController } from "./notifications/notif-controller";
import { MessageController } from "./chat/message/message-controller";
import { PrivateMessageController } from "./chat/privateMessage/privateMessage-controller";
import { rateLimit } from "express-rate-limit";

import { config } from "../../config/environment";
import { UserController } from "./users/user-controller";
import { AuthenticationController } from "./authentication/auth-controller";
import { AssignedThesisController } from "./assigned_theses/assigned-thesis-controller";
import { ThesisController } from "./theses/theses-controller";
import { FavouritesController } from "./favourites/favourites-controller";
import { DepartmentController } from "./departments/departments-controller";
import { ThesesReqController } from "./theses_requests/theses-controller";
import { UniversityController } from "./universities/university-controller";

const apiLimiter = rateLimit(config.apiLimiter);
// const authLimiter = rateLimit(config.authLimiter);
const notificationsLimiter = rateLimit(config.notifLimiter);
const chatLimiter = rateLimit(config.chatLimiter);

const apiV1Router = express.Router();
const notificationV1Router = express.Router();
const chatV1Router = express.Router();

apiV1Router
  .use("/auth", apiV1Router, new AuthenticationController().applyRoutes()) // ldap
  .use("/resource", apiLimiter, new ResourcesController().applyRoutes())
  .use("/areas", apiLimiter, new AreaController().applyRoutes())
  .use("/users", apiLimiter, new UserController().applyRoutes())
  .use("/theses", apiLimiter, new ThesisController().applyRoutes())
  .use("/favourites", apiLimiter, new FavouritesController().applyRoutes())
  .use("/departments", apiLimiter, new DepartmentController().applyRoutes())
  .use("/universities", apiLimiter, new UniversityController().applyRoutes())
  .use("/theses_requests", apiLimiter, new ThesesReqController().applyRoutes())
  .use("/assigned_theses", apiLimiter, new AssignedThesisController().applyRoutes());

notificationV1Router.use(
  "/",
  notificationsLimiter,
  new NotificationController().applyRoutes(),
);

chatV1Router
  .use("/message", chatLimiter, new MessageController().applyRoutes())
  .use(
    "/privateConversation",
    chatLimiter,
    new PrivateMessageController().applyRoutes(),
  );

export { apiV1Router, notificationV1Router, chatV1Router };
