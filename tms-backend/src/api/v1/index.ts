// TODO: Use correct routes
import * as express from 'express';
// import { EventController } from './companion-event/companion_event.controller';
// import { ExampleController } from './example/example.controller';
// import { ItemShopController } from './item-shop/item-shop.controller';
// import { LabelController } from './labels/labels.controller';
// import { PersonController } from './people/people.controller';
import { ResourcesController } from './resources/resources-controller';
// import { TaskController } from './task/task.controller';
const apiV1Router = express.Router();


apiV1Router
  // Example routes
  // .use(
  //   '/event',
  //   new EventController().applyRoutes()
  // )
  .use(
    '/resource',
    new ResourcesController().applyRoutes()
  )
  // .use(
  //   '/person',
  //   new PersonController().applyRoutes()
  // )
  // .use(
  //   '/label',
  //   new LabelController().applyRoutes()
  // );
;


export { apiV1Router };
