import { requiredType, valueRequired } from '../../middlewares/validators';

export default valueRequired([
  { value: 'wallet_address', type: requiredType.string },
  { value: 'network_id', type: requiredType.string },
]);
