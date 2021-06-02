import { requiredType, valueRequired } from '../../middlewares/validators';

export default valueRequired([
  { value: 'project_id', type: requiredType.number },
  { value: 'is_list_on_uniswap', type: requiredType.boolean, required: false },
  { value: 'is_owner_withdrawn', type: requiredType.boolean, required: false },
]);
