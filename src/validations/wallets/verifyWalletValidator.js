import { body } from 'express-validator';
import { requiredType, valueRequired } from '../../middlewares/validators';
import { regex } from '../../utils/regex';
import { errors } from '../../utils/system';
import { Validator } from '../validator';

export default [
  valueRequired([
    { value: 'wallet_address', type: requiredType.string },
    { value: 'chain_id', type: requiredType.string },
    { value: 'network_id', type: requiredType.number },
  ]),
  body("chain_id").custom(value => {
    return regex.hexaDecimal.test(value);
  }).withMessage(errors.INVALID_CHAIN_ID),
  Validator.check()
];
