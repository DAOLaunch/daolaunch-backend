import { requiredType, valueRequired } from '../../middlewares/validators';

export default valueRequired([
  { value: 'contract_address', type: requiredType.string },
  { value: 'presale_owner', type: requiredType.string },
  { value: 'presale_token', type: requiredType.string },
  { value: 'base_token', type: requiredType.string },
  { value: 'white_list', type: requiredType.array },
  { value: 'uint_params', type: requiredType.array },
  { value: 'network_id', type: requiredType.networkId },
]);
