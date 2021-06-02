import { query } from 'express-validator';
import { errors } from '../../utils/system';
import { Validator } from '../validator';

export default (isAllType = false) => [
  isAllType ?
    (
      query('file_type')
        .trim()
        .isString()
        .withMessage(errors.FILE_TYPE_INVALID)
    )
    :
    (
      query('file_type')
        .isIn(getEnv('S3_FILE_TYPE'))
        .withMessage(errors.FILE_TYPE_INVALID)
    ),
  query('file_name')
    .trim()
    .not()
    .isEmpty()
    .withMessage(errors.REQUIRED_FILE_NAME)
    .isString()
    .withMessage(errors.FILE_NAME_IS_STRING),
  Validator.check()
];
