import { handleExceptionResponse } from '../../utils/system';
import { exchangeService } from '../../services/uniswap.service';
import { authenticated, isValidNetworkId } from '../../middlewares/policies';
import getFairValidator from '../../validations/exchanges/getFairValidator';

const ExchangeController = require('express').Router();

ExchangeController.base = 'exchange';

/**
 * @description Get pair of uniswap
 */
ExchangeController.post('/uniswap/fair', [
  authenticated(),
  getFairValidator,
], async (req, res) => {
  try {
    const result = await exchangeService.getFair(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_UNISWAP_GET_FAIR_API', error);
  }
});

/**
 * @description List latest transactions
 */
ExchangeController.get('/latest-transactions', [
  authenticated(),
  isValidNetworkId(),
], async (req, res) => {
  try {
    const result = await exchangeService.latestTransactionList(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_LATEST_TRANSACTIONS_API', error);
  }
});

/**
 * @description Get gas price
 */
ExchangeController.get('/gas-price', [
  authenticated(),
  isValidNetworkId(),
], async (req, res) => {
  try {
    const result = await exchangeService.getGasPrice(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_GAS_PRICE_API', error);
  }
});

export { ExchangeController }
