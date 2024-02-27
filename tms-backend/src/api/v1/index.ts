// TODO: Use correct routes
import * as express from 'express';
// import { EventController } from './companion-event/companion_event.controller';
// import { ExampleController } from './example/example.controller';
// import { ItemShopController } from './item-shop/item-shop.controller';
// import { LabelController } from './labels/labels.controller';
// import { PersonController } from './people/people.controller';
import { ResourcesController } from './resources/resources-controller';
import { AreaController } from './area/area-controller';
import RateLimit from 'express-rate-limit';
import { config } from '../../config/environment';
// import { TaskController } from './task/task.controller';

const apiLimiter = RateLimit(config.apiLimiter)
const authLimiter = RateLimit(config.authLimiter)

const apiV1Router = express.Router();
// const chatV1Router = express.Router();
// const notificationV1Router = express.Router();

apiV1Router
  // Routes
  //Basic api route
  // .use(
  //   '/api',
  //   authLimiter,
  //   /**/
  // )
  .use(
    '/resource',
    apiLimiter,
    new ResourcesController().applyRoutes()
  )
  .use(
    '/areas',
    apiLimiter,
    new AreaController().applyRoutes()
  )
;


export { apiV1Router };
