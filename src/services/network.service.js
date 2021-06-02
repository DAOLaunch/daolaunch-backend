import { NetworkRepository } from '../repositories/network.repository';
import { errors, jsonError, jsonSuccess, logger } from '../utils/system';
import { sequelize } from '../core/boot';

class NetworkService {
  constructor() {
    this.networkRepository = new NetworkRepository();
  }

  async init() {
    const transaction = await sequelize.transaction();
    try {
      const attributes = [
        { network_id: 1, network_name: 'Ethereum Mainnet' },
        { network_id: 3, network_name: 'Ethereum Ropsten' },
        { network_id: 4, network_name: 'Ethereum Rinkeby' },
        { network_id: 5, network_name: 'Ethereum Goerli' },
        { network_id: 42, network_name: 'Ethereum Kovan' },
        { network_id: 56, network_name: 'Binance Smart Chain Mainnet' },
        { network_id: 97, network_name: 'Binance Smart Chain Testnet' },
      ];

      const result = await this.networkRepository.bulkCreate(attributes, transaction);

      await transaction.commit();

      return jsonSuccess(result);
    } catch (error) {
      await transaction.rollback();
      logger.error(`${new Date().toDateString()}_ERRORS_INIT_NETWORK_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }
}

export const networkService = new NetworkService();
