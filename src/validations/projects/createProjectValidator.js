import { requiredType, valueRequired } from '../../middlewares/validators';
import {
  EXCHANGE_LIST,
  INITIAL_LIQUIDITY_PERIOD_LIMIT,
  LISTING_RATE_LIMIT,
  LOCK_LIQUIDITY,
  CURRENCIES
} from '../../utils/constants';
import { Validator } from '../validator';
import { body } from 'express-validator';
import { errors } from '../../utils/system';
import moment from 'moment';
import { ACCESS_TYPE } from '../../models/schema/sale.model';
import { isValidWalletAddress } from '../../utils/common';

export default [
  valueRequired([
    /** Project */
    { value: 'project_logo', type: requiredType.string, required: false },
    { value: 'project_name', type: requiredType.string },
    { value: 'project_website', type: requiredType.text },
    { value: 'project_email', type: requiredType.email },
    { value: 'project_white_paper', type: requiredType.text, required: false },
    { value: 'project_additional_info', type: requiredType.text },
    { value: 'project_twitter', type: requiredType.text, required: false },
    { value: 'project_telegram', type: requiredType.text, required: false },
    { value: 'project_medium', type: requiredType.text, required: false },
    { value: 'project_discord', type: requiredType.text, required: false },
    { value: 'token_contract_address', type: requiredType.string },
    { value: 'token_name', type: requiredType.string },
    { value: 'token_symbol', type: requiredType.string, required: false },
    { value: 'token_decimal', type: requiredType.number, min: 0, max: 18 },
    { value: 'payment_currency', type: requiredType.string },
    { value: 'list_amm', type: requiredType.string },
    { value: 'currency_pair', type: requiredType.string },
    { value: 'contract_address', type: requiredType.string },

    /** Sale */
    { value: 'wallet_token_balance', type: requiredType.string, required: false },
    { value: 'sale_allocation', type: requiredType.numberString },
    { value: 'swap_ratio', type: requiredType.numberString },
    { value: 'hard_cap', type: requiredType.numberString },
    { value: 'soft_cap', type: requiredType.numberString },
    { value: 'max_allocation_wallet_limit', type: requiredType.boolean },
    { value: 'max_allocation_wallet', type: requiredType.stringAsNumber, required: false },
    { value: 'min_allocation_wallet_limit', type: requiredType.boolean },
    { value: 'min_allocation_wallet', type: requiredType.stringAsNumber, required: false },
    { value: 'access_type', type: requiredType.string },
    { value: 'sale_start_time', type: requiredType.dateTime },
    { value: 'sale_end_time', type: requiredType.dateTime },
    { value: 'listing_rate', type: requiredType.stringAsNumber, min: LISTING_RATE_LIMIT.MIN, max: LISTING_RATE_LIMIT.MAX },
    {
      value: 'initial_liquidity_per',
      type: requiredType.number,
      min: INITIAL_LIQUIDITY_PERIOD_LIMIT.MIN,
      max: INITIAL_LIQUIDITY_PERIOD_LIMIT.MAX,
    },
    { value: 'listing_time', type: requiredType.dateTime }, // > sale_end_time
    { value: 'lock_liquidity', type: requiredType.string }, // 1:1month 2:2months 3:3months 4:6months 5: 1year 6:2years
    { value: 'est_funding', type: requiredType.number }, // >= [wallet_token_amount] - [est_token_liquidity] - [est_token_sold]
    { value: 'whitelist', type: requiredType.array, required: false },
  ]),
  body('soft_cap')
    .custom(value => {
      return value > 0;
    })
    .withMessage(errors.SOFT_CAP_MUST_BE_BIGGER_THAN_0),
  body('access_type')
    .custom(value => Object.values(ACCESS_TYPE).includes(value))
    .withMessage(errors.INVALID_ACCESS_TYPE),
  body('whitelist.*')
    .custom(value => isValidWalletAddress(value))
    .withMessage(errors.INVALID_WHITELIST),
  // Handle required min/max allocation wallet
  body('max_allocation_wallet')
    .custom((value, { req }) => {
      return req.body.max_allocation_wallet_limit ? !!value : true;
    })
    .withMessage(errors.REQUIRED_MAX_ALLOCATION_WALLET),
  body('min_allocation_wallet')
    .custom((value, { req }) => {
      return req.body.min_allocation_wallet_limit ? !!value : true;
    })
    .withMessage(errors.REQUIRED_MIN_ALLOCATION_WALLET),
  // Connect Ethereum 1:ETH 2:USDT / Connect BSC 1:BNB 2:BUSD
  body('payment_currency')
    .custom(value => {
      return [
        ...Object.keys(CURRENCIES.ETH),
        ...Object.keys(CURRENCIES.BSC),
      ].includes(value);
    })
    .withMessage(errors.INVALID_PAYMENT_CURRENCY),
  // β ver 1:uniswap
  body('list_amm')
    .custom(value => {
      return Object.values(EXCHANGE_LIST).includes(value);
    })
    .withMessage(errors.INVALID_LIST_AMM),
  // β ver 1:uniswap
  body('currency_pair')
    .custom(value => {
      return Object.keys(EXCHANGE_LIST).includes(value);
    })
    .withMessage(errors.INVALID_CURRENCY_PAIR),
  // >= sale_allocation
  body('max_allocation_wallet')
    .custom((value, { req }) => {
      if (!req.body.max_allocation_wallet_limit) {
        return true
      }
      return +value <= +req.body.hard_cap;
    })
    .withMessage(errors.MAX_ALLOCATION_WALLET_MUST_BE_LOWER_THAN_HARD_CAP),
  // < mx_allocation_wallet
  body('min_allocation_wallet')
    .custom((value, { req }) => {
      if (!req.body.min_allocation_wallet_limit || !req.body.max_allocation_wallet_limit) {
        return true
      }
      return +value < +req.body.max_allocation_wallet;
    })
    .withMessage(errors.MIN_ALLOCATION_WALLET_MUST_BE_LOWER_THEN_MAX_ALLOCATION_WALLET),
  // Within 30 days from today
  body('sale_start_time')
    .custom(value => {
      const rangeDays = moment(new Date(value)).diff(moment(new Date()).format(), 'days')
      return rangeDays >= 0 && rangeDays <= 30;
    })
    .withMessage(errors.SALE_START_TIME_MUST_BE_LESS_THAN_30_DAYS_FROM_NOW),
  // Within 90 days after the start date
  body('sale_end_time')
    .custom((value, { req }) => {
      const rangeDays = moment(new Date(value)).diff(moment(req.body.sale_start_time).format(), 'days')

      return rangeDays >= 0 && rangeDays <= 90;
    })
    .withMessage(errors.SALE_END_TIME_MUST_BE_LESS_THAN_90_DAYS_FROM_SALE_START_TIME),
  // > sale_end_time
  body('listing_time')
    .custom((value, { req }) => {
      return (value - req.body.sale_end_time) > 0;
    })
    .withMessage(errors.LISTING_TIME_MUST_BE_BIGGER_THAN_SALE_END_TIME),
  // 1:1month 2:2months 3:3months 4:6months 5: 1year 6:2years
  body('lock_liquidity')
    .custom(value => {
      return Object.keys(LOCK_LIQUIDITY).includes(value);
    })
    .withMessage(errors.INVALID_LOCK_LIQUIDITY),
  Validator.check()
];
