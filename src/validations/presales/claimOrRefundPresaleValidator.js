import { requiredType, valueRequired } from '../../middlewares/validators';

export default valueRequired([
  { value: 'contract_address', type: requiredType.string },
  { value: 'network_id', type: requiredType.string },
]);
