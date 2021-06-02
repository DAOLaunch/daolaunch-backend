import { errors, jsonError, jsonSuccess, logger } from '../utils/system';
import { CURRENCY, NETWORK_LIST, PROVIDERS, UNISWAP, UNISWAP_ABI, NETWORK_ID_LIST } from '../utils/constants';
import Web3 from 'web3';
import { apiGet } from '../utils/request';

class ExchangeService {
  /**
   * Get uniswap pair
   * @param {*} sale_token token address
   * @param {*} base_token ETH or USDT for ethereum
   * @param {*} network_id networkId
   */
  async getFair({ sale_token, base_token, network_id }) {
    try {
      const provider = PROVIDERS[network_id];
      if (!provider) {
        return jsonError(errors.INVALID_NETWORK);
      }

      const uniswapAddress = UNISWAP[network_id];
      if (!uniswapAddress) {
        return jsonError(errors.INVALID_ADDRESS);
      }

      const currency = CURRENCY[network_id][base_token];
      if (!currency) {
        return jsonError(errors.INVALID_CURRENCY);
      }

      const web3 = new Web3(provider);
      const uniswapFactory = new web3.eth.Contract(UNISWAP_ABI, uniswapAddress);
      const result = await uniswapFactory.methods.getPair(sale_token, currency).call();

      return jsonSuccess(result);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_FAIR_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Get latest transactions
   * @param {Object} wallet
   */
  async latestTransactionList({ wallet }) {
    try {
      const { network_id } = wallet;
      const network = NETWORK_LIST.find(net => net.NETWORK_ID === network_id);

      let apiKey = '';
      if(network.NETWORK_ID === NETWORK_ID_LIST.BSC_TESTNET || network.NETWORK_ID ===  NETWORK_ID_LIST.BSC_MAINNET) {
        apiKey = getEnv('BSC_API_KEY');
      } else {
        apiKey = getEnv('ETHERSCAN_API_KEY');
      }

      const sort = 'desc';

      const query = {
        module: 'account',
        action: 'txlist',
        address: wallet.wallet_address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 3,
        sort,
        apiKey,
      }

      const url = `${network.API_URL}/api`;

      const transactions = await apiGet({
        url,
        query,
      });

      const { status, result } = transactions;
      if (!+status) {
        return jsonError(errors.NO_TRANSACTIONS_FOUND);
      }

      const responseResult = result.map(item => ({
        hash: item.hash,
        timeStamp: item.timeStamp,
      }));

      return jsonSuccess(responseResult);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_LATEST_TRANSACTION_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Get gas prices
   * @return {Object} wallet
   */
  async getGasPrice({ wallet }) {
    try {
      const { network_id } = wallet;
      const network = NETWORK_LIST.find(net => net.NETWORK_ID === network_id);

      let apiKey = '';
      if(network.NETWORK_ID === NETWORK_ID_LIST.BSC_TESTNET || network.NETWORK_ID === NETWORK_ID_LIST.BSC_MAINNET) {
        apiKey = getEnv('BSC_API_KEY');
      } else {
        apiKey = getEnv('ETHERSCAN_API_KEY');
      }

      const url = `${network.API_URL}/api?module=proxy&action=eth_gasPrice&apikey=${apiKey}`;
      const gasPrice = await apiGet({ url });
      return jsonSuccess(gasPrice);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_GAS_PRICE_SERVICE`, error);
      return jsonError(errors.CAN_NOT_GET_GAS_PRICE);
    }
  }
}

export const exchangeService = new ExchangeService();
