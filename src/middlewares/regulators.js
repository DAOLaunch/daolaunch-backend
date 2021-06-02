import { handleExceptionResponse, jsonError, logger } from '../utils/system';
import { textAttrs } from '../core/boot';

const requestLogger = () => {
  return (req, res, next) => {
    if (["GET", "POST", "PUT", "DELETE"].indexOf(req.method) >= 0)
      logger.verbose(req.url, req.body);
    next();
  };
};

const uploadFileToBody = () => {
  return (req, res, next) => {
    try {
      if (req.files) {
        let keys = Object.keys(req.files);
        for (let i = 0; i < keys.length; i++) {
          req.body[keys[i]] = req.files[keys[i]];
        }
      }
      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_UPLOAD_FILE_TO_BODY_MIDDLEWARE', error);
    }
  };
};

/** Check max length string attributes 255 of body*/
const checkMaxLengthBody = () => {
  return (req, res, next) => {
    try {
      if (req.body) {
        let keys = Object.keys(req.body);
        for (let i = 0; i < keys.length; i++) {
          if (!textAttrs.includes(keys[i]) && req.body[keys[i]] && req.body[keys[i]].length > 255) {
            return res.json(jsonError({ code: `${keys[i].toUpperCase()}_MAX_255_ERROR` }));
          }
        }
      }
      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_CHECK_MAX_LENGTH_BODY_MIDDLEWARE', error);
    }
  };
};

// /**
//  * Authenticate middleware used for admin token
//  */
// const checkMaintainableStatus = () => {
//   return async (req, res, next) => {
//     try {
//       const path = req.path;
//       const isAllowed = path.indexOf('/admin') === 0;
//
//       const maintenanceSetting = await Setting.findOne({ where: { name: 'IS_MAINTAINABLE' } });
//
//       const isMaintainable = maintenanceSetting && +maintenanceSetting.value
//       // If maintain mode is on and api request not from /admin then refuse
//       // else it will continue to check maintain mode in isAdminActive policy
//
//       if (isMaintainable && !isAllowed) {
//         return res.json(jsonError(errors.WEBSITE_IS_UNDER_MAINTENANCE));
//       }
//
//       req.body.isMaintainable = isMaintainable;
//
//       return next();
//     } catch (error) {
//       handleExceptionResponse(res, 'ERRORS_ADMIN_POLICIES_CHECK_MAINTAINABLE_STATUS_MIDDLEWARE', error);
//     }
//   };
// };

const regulators = [
  requestLogger(),
  uploadFileToBody(),
  checkMaxLengthBody(),
  // checkMaintainableStatus(),
];

export {
  regulators,
}
