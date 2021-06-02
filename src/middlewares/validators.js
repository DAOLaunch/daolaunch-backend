'use strict';

import { isValidObjectId } from '../utils/validation';
import { errors, jsonError, handleExceptionResponse } from '../utils/system';
import { regex } from '../utils/regex';
import moment from 'moment';
import { PROVIDERS } from '../utils/constants';

const requiredType = {
  email: 'email',
  number: 'number',
  string: 'string',
  text: 'text',
  phone: 'phone',
  array: 'array',
  dateTime: 'dateTime',
  fax: 'fax',
  boolean: 'boolean',
  postalCode: 'postalCode',
  date: 'date',
  time: 'time',
  numberString: 'numberString',
  stringAsNumber: 'stringAsNumber',
  networkId: 'networkId',
};

const format = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm'
}


const valueRequired = attributes => {
  return (req, res, next) => {
    try {
      const missing = attributes.find(attr => {
        const nameErr = (attr.value && attr.value.toUpperCase());

        if (attr.required !== false) {
          /** Validate attribute required */
          if (!req.body || req.body[attr.value] === undefined || req.body[attr.value] === null || req.body[attr.value] === '') {
            attr.err = `REQUIRED_${nameErr}`;
            return true;
          }
        }

        if (req.body[attr.value] && attr.regex && !attr.regex.test(req.body[attr.value])) {
          attr.err = `${nameErr}_INVALID`;
          return true;
        }

        if (req.body[attr.value]) {
          switch (attr.type) {
            /** Validate attribute is string */
            case requiredType.string:
              attr.max = attr.max ? attr.max : 255;
              if (typeof req.body[attr.value] !== requiredType.string) {
                attr.err = `${nameErr}_IS_STRING`;
                return true;
              }

              /** Validate max of attribute */
              if (attr.max < req.body[attr.value].length) {
                attr.err = `${nameErr}_MAX_${attr.max}`;
                return true;
              }

              break;
            /** Validate attribute is string */
            case requiredType.text:
              if (typeof req.body[attr.value] !== requiredType.string) {
                attr.err = `${nameErr}_IS_TEXT`;
                return true;
              }

              break;
            /** Validate attribute is number */
            case requiredType.number:
              if (typeof req.body[attr.value] !== requiredType.number) {
                attr.err = `${nameErr}_IS_NUMBER`;
                return true;
              }

              /** Validate max of attribute */
              if (attr.max < req.body[attr.value]) {
                attr.err = `${nameErr}_MAX_${attr.max}`;
                return true;
              }
              break;
            case requiredType.email:
              attr.max = attr.max ? attr.max : 255;
              /** Validate attribute is email */
              if (!regex.email.test(req.body[attr.value])) {
                attr.err = `${nameErr}_NOT_VALID_EMAIL`;
                return true;
              }

              /** Validate max of attribute */
              if (attr.max < req.body[attr.value].length) {
                attr.err = `${nameErr}_MAX_${attr.max}`;
                return true;
              }
              break;
            case requiredType.phone:
              attr.max = attr.max ? attr.max : 30;
              /** Validate attribute is phone */
              if (!regex.phoneNumber.test(req.body[attr.value])) {
                attr.err = `${nameErr}_NOT_VALID_PHONE_NUMBER`;
                return true;
              }

              /** Validate max of attribute */
              if (attr.max < req.body[attr.value].length) {
                attr.err = `${nameErr}_MAX_${attr.max}`;
                return true;
              }
              break;
            case requiredType.array:
              if (!Array.isArray(req.body[attr.value])) {
                attr.err = `${nameErr}_IS_ARRAY`;
                return true;
              }

              /** Validate max of attribute */
              if (attr.max < req.body[attr.value].length) {
                attr.err = `${nameErr}_MAX_${attr.max}`;
                return true;
              }

              /** Validate min of attribute */
              if (attr.min > req.body[attr.value].length) {
                attr.err = `${nameErr}_MIN_${attr.min}`;
                return true;
              }
              break;
            case requiredType.dateTime:
              const dateTime = moment(new Date(req.body[attr.value]));
              if (!dateTime.isValid()) {
                attr.err = `${nameErr}_IS_DATE_TIME`;
                return true;
              }

              // convert to date time
              req.body[attr.value] = dateTime.toDate();
              break;
            case requiredType.date:
              const date = moment(req.body[attr.value], format.date);
              if (!date.isValid()) {
                attr.err = `${nameErr}_IS_DATE_FORMAT_${format.date}`;
                return true;
              }

              // convert to date
              req.body[attr.value] = date.format(format.date);
              break;
            case requiredType.time:
              const time = moment(req.body[attr.value], format.time);
              if (!time.isValid()) {
                attr.err = `${nameErr}_IS_TIME_FORMAT_${format.time}`;
                return true;
              }

              // convert to date
              req.body[attr.value] = time.format(format.time);
              break;
            case requiredType.fax:
              attr.max = attr.max ? attr.max : 30;
              /** Validate attribute is fax */
              if (!regex.fax.test(req.body[attr.value])) {
                attr.err = `${nameErr}_NOT_VALID_FAX`;
                return true;
              }

              /** Validate max of attribute */
              if (attr.max < req.body[attr.value].length) {
                attr.err = `${nameErr}_MAX_${attr.max}`;
                return true;
              }

              break;
            case requiredType.postalCode:
              /** Validate attribute is fax */
              if (!regex.postalCode.test(req.body[attr.value])) {
                attr.err = `${nameErr}_NOT_VALID_POSTAL_CODE`;
                return true;
              }
              break;
            case requiredType.boolean:
              /** Validate attribute is boolean */
              if (typeof req.body[attr.value] !== requiredType.boolean) {
                attr.err = `${nameErr}_IS_BOOLEAN`;
                return true;
              }
              break;
            case requiredType.numberString:
              /** Validate attribute is number string */
              if (typeof req.body[attr.value] !== requiredType.number || !(+req.body[attr.value])) {
                attr.err = `${nameErr}_IS_NUMBER`;
                return true;
              }

              attr.max = attr.max || 255;
              if (req.body[attr.value].toString().length > attr.max) {
                attr.err = `${nameErr}_MAX_IS_${attr.max}`;
                return true;
              }

              if (attr.min) {
                if (req.body[attr.value] < attr.min) {
                  attr.err = `${nameErr}_MIN_IS_${attr.min}`;
                  return true;
                }
              }
              break;
            case requiredType.stringAsNumber:
              /** Validate attribute is number string */
              if (typeof req.body[attr.value] !== requiredType.string || isNaN(+req.body[attr.value])) {
                attr.err = `${nameErr}_IS_STRING`;
                return true;
              }

              attr.max = attr.max || 255;
              if (req.body[attr.value].toString().length > attr.max) {
                attr.err = `${nameErr}_NOT_VALID_STRING_AS_NUMBER`;
                return true;
              }
              break;
            case requiredType.networkId:
              if (!req.body[attr.value]) {
                attr.err = 'REQUIRED_NETWORK_ID';
                return true;
              }
              if (!Object.keys(PROVIDERS).includes(req.body[attr.value])) {
                attr.err = 'INVALID_NETWORK_ID';
                return true;
              }
              break;
            default: break;
          }
        }
      });

      if (missing) {
        return res.json(jsonError({ code: missing.err, field_name: missing.value }));
      }

      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_VALIDATE_BODY_FUNCTION', error);
    }
  };
};

const validObjectId = ({ attributes }) => {
  return (req, res, next) => {
    let invalid = attributes.some((attr) => {
      if (!req.body || !req.body[attr])
        return false;
      return !isValidObjectId(req.body[attr]);
    });
    if (invalid)
      return res.json(jsonError(errors.NOT_VALID_ID));
    return next();
  }
};

const validScope = ({ attributes }) => {
  const scopes = Object.keys(ACCESS_SCOPES).map(key => ACCESS_SCOPES[key]);
  return (req, res, next) => {
    let invalid = attributes.some((attr) => {
      if (!req.body || !req.body[attr])
        return false;
      return scopes.indexOf(req.body[attr]) === -1;
    });
    if (invalid)
      return res.json(jsonError(errors.INVALID_ACCESS_SCOPE));
    return next();
  }
};

export { valueRequired, validObjectId, validScope, requiredType, format };
