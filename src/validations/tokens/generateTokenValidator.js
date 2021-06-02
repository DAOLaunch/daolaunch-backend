import { body } from 'express-validator';
import { requiredType, valueRequired } from '../../middlewares/validators';
import { errors } from '../../utils/system';

export default [
  valueRequired([
    { value: 'token_name', type: requiredType.string },
    { value: 'token_symbol', type: requiredType.string },
    { value: 'token_supply', type: requiredType.string },
    { value: 'token_decimal_place', type: requiredType.string },
  ]),
  body('token_supply').custom(value => {
    return !isNaN(value) && (parseFloat(value) > 999999999999 || parseFloat(value) < 0)
  })
    .withMessage(errors.INVALID_TOKEN_SUPPLY),
  body('token_decimal_place').custom(value => {
    return !isNaN(value) && (parseFloat(value) > 18 || parseFloat(value) < 0)
  })
    .withMessage(errors.INVALID_TOKEN_DECIMAL_PLACE),
];
