import * as express from "express";
import { apiV1Router, notificationV1Router } from "./v1";

export class Api {
  /**
   * Apply all app routes including models and auth
   *
   * @param {express.Application} app
   * @returns {Promise<express.Router>}
   */
  public static async applyRoutes(
    app: express.Application,
  ): Promise<express.Router> {
    const apiRouter = express.Router();

    apiRouter.use("/api/", apiV1Router);
    apiRouter.use("/notifications/", notificationV1Router);
    // NOTE: {Use /chat, /notifications ROUTES for the other 2 servers
    // combining all 3 servers into 1.}
    // apiRouter.use('/chat', /**/);

    return apiRouter;
  }
}
