import winston from './winston';
import winstonLb from 'winston';
import moment from 'moment';

const errors = {
  /** SERVER ERRORS */
  SYSTEM_ERROR: { code: 'SYSTEM_ERROR' },
  ENV_NOT_SET_ERROR: { code: 'ENV_NOT_SET_ERROR' },
  SERVER_SHUTTING_DOWN: { code: 'SERVER_SHUTTING_DOWN' },
  DUPLICATED_ERROR: { code: 'DUPLICATED_ERROR' },
  WEBSITE_IS_UNDER_MAINTENANCE: { code: 'WEBSITE_IS_UNDER_MAINTENANCE' },
  LISTEN_ERROR: { code: 'LISTEN_ERROR' },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND' },
  WRONG_PASSWORD: { code: 'WRONG_PASSWORD' },
  NOT_AUTHENTICATED_ERROR: { code: 'NOT_AUTHENTICATED_ERROR' },

  /** WALLET ERROR */
  TOKEN_EXPIRED_ERROR: { code: 'TOKEN_EXPIRED_ERROR' },
  INVALID_TOKEN: { code: 'INVALID_TOKEN' },
  INVALID_ADDRESS: { code: 'INVALID_ADDRESS' },
  INVALID_CURRENCY: { code: 'INVALID_CURRENCY' },
  INVALID_TOKEN_ADDRESS: { code: 'INVALID_TOKEN_ADDRESS' },
  INVALID_CHAIN_ID: { code: 'INVALID_CHAIN_ID' },
  INVALID_WALLET: { code: 'INVALID_WALLET' },

  /** AWS ERRORS */
  FILE_TYPE_INVALID: { code: 'FILE_TYPE_INVALID' },
  REQUIRED_FILE_NAME: { code: 'REQUIRED_FILE_NAME' },
  FILE_NAME_IS_STRING: { code: 'FILE_NAME_IS_STRING' },

  /** PROJECT ERRORS */
  WALLET_NOT_FOUND: { code: 'WALLET_NOT_FOUND' },
  INVALID_SALE_ALLOCATION: { code: 'INVALID_SALE_ALLOCATION' },
  INVALID_PAYMENT_CURRENCY: { code: 'INVALID_PAYMENT_CURRENCY' },
  MAX_ALLOCATION_WALLET_MUST_BE_LOWER_THAN_HARD_CAP: { code: 'ALLOCATION_WALLET_MUST_BE_BIGGER_THEN_SALE_ALLOCATION' },
  MIN_ALLOCATION_WALLET_MUST_BE_LOWER_THEN_MAX_ALLOCATION_WALLET: { code: 'ALLOCATION_WALLET_MUST_BE_LOWER_THEN_MAX_ALLOCATION_WALLET' },
  SALE_START_TIME_MUST_BE_LESS_THAN_30_DAYS_FROM_NOW: { code: 'SALE_START_TIME_MUST_BE_LESS_THAN_30_DAYS_FROM_NOW' },
  SALE_END_TIME_MUST_BE_LESS_THAN_90_DAYS_FROM_SALE_START_TIME: { code: 'SALE_END_TIME_MUST_BE_LESS_THAN_90_DAYS_FROM_SALE_START_TIME' },
  LISTING_TIME_MUST_BE_BIGGER_THAN_SALE_END_TIME: { code: 'LISTING_TIME_MUST_BE_BIGGER_THAN_SALE_END_TIME' },
  INVALID_LOCK_LIQUIDITY: { code: 'INVALID_LOCK_LIQUIDITY' },
  REQUIRED_MAX_ALLOCATION_WALLET: { code: 'REQUIRED_MAX_ALLOCATION_WALLET' },
  REQUIRED_MIN_ALLOCATION_WALLET: { code: 'REQUIRED_MIN_ALLOCATION_WALLET' },
  INVALID_LIST_AMM: { code: 'INVALID_LIST_AMM' },
  INVALID_CURRENCY_PAIR: { code: 'INVALID_CURRENCY_PAIR' },
  INVALID_ACCESS_TYPE: { code: 'INVALID_ACCESS_TYPE' },
  INVALID_WHITELIST: { code: 'INVALID_WHITELIST' },
  PROJECT_NOT_FOUND: { code: 'PROJECT_NOT_FOUND' },
  WALLET_NOT_IN_WHITELIST: { code: 'WALLET_NOT_IN_WHITELIST' },
  NOT_ENOUGH_USDT_IN_WALLET: { code: 'NOT_ENOUGH_USDT_IN_WALLET' },
  SOFT_CAP_MUST_BE_BIGGER_THAN_0: { code: 'SOFT_CAP_MUST_BE_BIGGER_THAN_0' },
  NOT_ENOUGH_BUSD_IN_WALLET: { code: 'NOT_ENOUGH_BUSD_IN_WALLET' },
  CONTRACT_ADDRESS_IS_LIVE_OR_UPCOMING: { code: 'CONTRACT_ADDRESS_IS_LIVE_OR_UPCOMING' },
  ALL_TOKEN_HAS_BEEN_SOLD_OUT: { code: 'ALL_TOKEN_HAS_BEEN_SOLD_OUT' },
  TOTAL_TOKEN_BOUGHT_AND_BUYING_HAS_EXCEEDED_THE_LIMIT: { code: 'TOTAL_TOKEN_BOUGHT_AND_BUYING_HAS_EXCEEDED_THE_LIMIT' },

  /** TOKEN ERRORS */
  INVALID_TOKEN_SUPPLY: { code: 'INVALID_TOKEN_SUPPLY' },
  INVALID_TOKEN_DECIMAL_PLACE: { code: 'INVALID_TOKEN_DECIMAL_PLACE' },
  DEPOSIT_AMOUNT_CANNOT_BE_NEGATIVE_NUMBER: { code: 'DEPOSIT_AMOUNT_CANNOT_BE_NEGATIVE_NUMBER' },

  /** NETWORK ERRORS */
  INVALID_NETWORK: { code: 'INVALID_NETWORK' },
  INVALID_ABI: { code: 'INVALID_ABI' },

  /** TRANSACTION ERRORS */
  NO_TRANSACTIONS_FOUND: { code: 'NO_TRANSACTIONS_FOUND' },

  /** PRESALE ERRORS */
  CAN_NOT_GET_DEPOSIT: { code: 'CAN_NOT_GET_DEPOSIT' },

  /** EXCHANGE ERRORS */
  CAN_NOT_GET_GAS_PRICE: { code: 'CAN_NOT_GET_GAS_PRICE' },
}

const jsonSuccess = (result = null) => {
  return { success: true, result };
};

const jsonError = (err = null) => {
  return { success: false, error: err };
};

/** Define group log */
const logAttribute = {
  group: { order: 'order', estimation: 'estimation', mail: 'mail' },
  action: { create: 'create' },
  prefix: { admin: 'admin', user: 'user' },
  type: { info: 'info', error: 'error' }
};

/** Config logger */
const configLogger = ({ data, group, action, prefix, type }) => {
  try {
    if (group && action && prefix && type) {
      const isInValidParams = !logAttribute.group[group]
        || !logAttribute.action[action]
        || !logAttribute.prefix[prefix]
        || !logAttribute.type[type];

      if (isInValidParams) {
        console.log('[LOGGER] Group log is invalid!');
        return;
      }

      const date = moment().format('YYYY-MM-DD');
      const filename = `${getEnv('PATH_LOG')}/${prefix}/${type}/${group}/${action}/${date}.log`;

      const fileLogger = winstonLb.createLogger({
        transports: [
          new (winstonLb.transports.File)({
            filename: filename,
            colorize: true
          })
        ],
        exitOnError: false
      });

      data = type === logAttribute.type.error ? { name: data.name, message: data.message } : data;
      fileLogger[type]({ time: moment(), data });
    }
  } catch (error) {
    console.log(error)
    throw error;
  }
};

const logger = {
  verbose: message => {
    if (getEnv('FULL_LOG') !== 'true') return;
    return winston.verbose(message);
  },
  warn: message => {
    if (getEnv('FULL_LOG') !== 'true') return;
    return winston.warn(message);
  },
  error: (message, error, attr) => {
    /** Write log*/
    configLogger({ ...attr, data: error, type: logAttribute.type.error });

    return winston.error(`${message}::${error}`);
  },
  info: (message, attr) => {
    try {
      /** Write log*/
      configLogger({ ...attr, type: logAttribute.type.info });
      return winston.info(message);
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Exception handler in catch controller
 * @param {Object} res response
 * @param {any} error error
 */
const handleExceptionResponse = (res, errName, err) => {
  // Logger
  logger.error(`${new Date().toDateString()}_${errName}`, err);

  if (err.original && err.original.code === 'ERR_DUP_ENTRY') {
    return res.json(jsonError(errors.DUPLICATED_ERROR));
  }

  return res.json(jsonError(errors.SYSTEM_ERROR));
};

export {
  jsonSuccess,
  jsonError,
  logger,
  errors,
  handleExceptionResponse,
}
