import { requiredType, valueRequired } from '../../middlewares/validators';

export default [
  valueRequired([
    { value: 'token_name', type: requiredType.string, min: 1, max: 64 },
    { value: 'token_symbol', type: requiredType.string, min: 1, max: 16 },
    { value: 'token_supply', type: requiredType.stringAsNumber, min: 0, max: 999999999999 },
    { value: 'token_decimal_place', type: requiredType.number, min: 0, max: 18 },
    { value: 'token_contract_address', type: requiredType.string, required: false },
    { value: 'token_transaction_hash', type: requiredType.string },
  ]),
];
