import { requiredType, valueRequired } from '../../middlewares/validators';

export default valueRequired([
  { value: 'log', type: requiredType.string },
]);
