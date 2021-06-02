import { body } from 'express-validator';
import { requiredType, valueRequired } from '../../middlewares/validators';
import { errors } from '../../utils/system';
import { Validator } from '../validator';

export default [
  valueRequired([
    { value: 'contract_address', type: requiredType.string },
    { value: 'network_id', type: requiredType.networkId },
    { value: 'token_amount', type: requiredType.stringAsNumber },
    { value: 'eth', type: requiredType.stringAsNumber },
    { value: 'caller', type: requiredType.string },
  ]),
  body('token_amount')
    .custom(value => {
      return +value >= 0
    })
    .withMessage(errors.DEPOSIT_AMOUNT_CANNOT_BE_NEGATIVE_NUMBER),
  Validator.check()
];
