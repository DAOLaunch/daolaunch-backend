import { authenticated } from '../middlewares/policies';
import { handleExceptionResponse } from '../utils/system';

/** import validator */
import awsValidator from '../validations/aws/awsValidator';
import multipleAwsValidator from '../validations/aws/multipleAwsValidator';
import { awsService } from '../services/aws.service';


const AwsController = require('express').Router();

AwsController.base = 'aws';

/**
 * @description Sign s3 url
 * @param {String} file_type
 * @param {String} file_name
 */
AwsController.get('/signs3', [
  authenticated(),
  awsValidator()
], async (req, res) => {
  try {
    const data = await awsService.signS3(req.query);
    return res.json(data);
  } catch (error) {
    handleExceptionResponse(res, 'ERROR_SIGN_S3', error);
  }
});

/**
 * @description Sign s3 url (All file type)
 * @param {String} file_type
 * @param {String} file_name
 */
AwsController.get('/signs3/all-type', [
  authenticated(),
  awsValidator(true)
], async (req, res) => {
  try {
    const data = await awsService.signS3(req.query);
    return res.json(data);
  } catch (error) {
    handleExceptionResponse(res, 'ERROR_SIGN_S3_ALL_TYPE', error);
  }
});

/**
 * @description Sign s3 urls
 * @param {Object} files
 */
AwsController.post('/multiply-signs3', [
  authenticated(),
  multipleAwsValidator
], async (req, res) => {
  try {
    const data = await awsService.signMultipleS3(req.body);
    return res.json(data);
  } catch (error) {
    handleExceptionResponse(res, 'ERROR_SIGN_S3', error);
  }
});


export { AwsController };
