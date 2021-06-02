import { body } from 'express-validator';
import { errors } from '../../utils/system';
import { Validator } from '../validator';

export default [
  body('files')
    .isArray()
    .withMessage(errors.FILES_IS_ARRAY)
    .custom((files) => {
      const err = files.some(file => {
        /** Check file_name and file_type */
        const isInValidFile = !getEnv('S3_FILE_TYPE').includes(file.file_type)
          || !file.file_name
          || typeof file.file_name !== 'string';
        if (isInValidFile) {
          return true;
        }
      });

      return !err;
    })
    .withMessage(errors.ITEM_OF_FILES_INVALID),
  Validator.check()
];
