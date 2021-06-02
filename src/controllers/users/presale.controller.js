import { handleExceptionResponse } from '../../utils/system';
import { authenticated, isProjectExisted, isValidNetworkId } from '../../middlewares/policies';
import { presaleService } from '../../services/presale.service';

import createPresaleValidator from '../../validations/presales/createPresaleValidator';
import getPresaleStatusValidator from '../../validations/presales/getPresaleStatusValidator';
import getPresaleDepositValidator from '../../validations/presales/getPresaleDepositValidator';
import getPresaleAddressValidator from '../../validations/presales/getPresaleAddressValidator';
import getAllowancedValidator from '../../validations/presales/getAllowancedValidator';
import updatePresaleStatusValidator from '../../validations/presales/updatePresaleStatusValidator';

const PresaleController = require('express').Router();

PresaleController.base = 'presale';

/**
 * @description Create presale
 */
PresaleController.post('/', [
  createPresaleValidator,
], async (req, res) => {
  try {
    const result = await presaleService.getCreatePresaleData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_CREATE_PRESALE_API', error);
  }
});

/**
 * @description get deposit
 */
PresaleController.post('/get-deposit', [
  authenticated(),
  getPresaleDepositValidator,
], async (req, res) => {
  try {
    const result = await presaleService.getDepositData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_DEPOSIT_API', error);
  }
});

/**
 * @description get status
 */
PresaleController.post('/get-status', [
  getPresaleStatusValidator,
], async (req, res) => {
  try {
    const result = await presaleService.getPresaleStatus(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_PRESALE_STATUS_API', error);
  }
});

/**
 * @description
 */
PresaleController.post('/get-address', [
  getPresaleAddressValidator,
], async (req, res) => {
  try {
    const result = await presaleService.getPresaleAddress(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_PRESALE_ADDRESS_API', error);
  }
});

/**
 * @description Claim data
 */
PresaleController.post('/claim', [
  authenticated(),
  isProjectExisted(),
], async (req, res) => {
  try {
    const result = await presaleService.getClaimData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_CLAIM_API', error);
  }
});

/**
 * @description Claim data
 */
PresaleController.post('/refund', [
  authenticated(),
  isProjectExisted(),
], async (req, res) => {
  try {
    const result = await presaleService.getRefundData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_REFUND_API', error);
  }
});

/**
 * @description Buyer data
 */
PresaleController.post('/get-buyer-data', [
  authenticated(),
  isProjectExisted(false),
], async (req, res) => {
  try {
    const result = await presaleService.getBuyerInfo(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_BUYER_DATA_API', error);
  }
});

/**
 * @description Get allowanced data
 */
PresaleController.post('/get-allowanced-data', [
  authenticated(),
  getAllowancedValidator,
  isValidNetworkId(true),
], async (req, res) => {
  try {
    const result = await presaleService.getAllowancedData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_ALLOWANCED_DATA_API', error);
  }
});

/**
 * @description Get owner claim data
 */
PresaleController.post('/get-owner-claim-data', [
  authenticated(),
  isProjectExisted(true),
], async (req, res) => {
  try {
    const result = await presaleService.getOwnerClaimData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_OWNER_CLAIM_DATA_API', error);
  }
});

/**
 * @description Owner claim unsold token
 */
PresaleController.post('/get-owner-refund-data', [
  authenticated(),
  isProjectExisted(true),
], async (req, res) => {
  try {
    const result = await presaleService.getOwnerRefundData(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_LIST_ON_UNISWAP_DATA_API', error);
  }
});

// /**
//  * @description Get list on uniswap data
//  */
// PresaleController.post('/get-list-on-uniswap-data', [
//   authenticated(),
//   isProjectExisted(true),
// ], async (req, res) => {
//   try {
//     const result = await presaleService.getListOnUniswapData(req.body);
//     res.json(result);
//   } catch (error) {
//     handleExceptionResponse(res, 'ERRORS_GET_LIST_ON_UNISWAP_DATA_API', error);
//   }
// });

/**
 * @description Get list on uniswap data
 */
PresaleController.put('/update-status', [
  authenticated(),
  updatePresaleStatusValidator,
  isProjectExisted(true),
], async (req, res) => {
  try {
    const result = await presaleService.updatePresaleStatus(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_UPDATE_PRESALE_STATUS_API', error);
  }
});

export { PresaleController }
