import { AwsController } from './AwsController';
import * as userControllers from './users';

const controllers = [
  AwsController,
]

const commonController = {
  controllers
}

export {
  userControllers,
  commonController
}
