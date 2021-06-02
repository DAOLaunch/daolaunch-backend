import { requiredType, valueRequired } from '../../middlewares/validators';

export default valueRequired([
  { value: 'sale_token', type: requiredType.string },
  { value: 'base_token', type: requiredType.string },
  { value: 'network_id', type: requiredType.string },
]);
