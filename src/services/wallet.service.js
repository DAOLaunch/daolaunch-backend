import { jsonError, errors, logger, jsonSuccess } from '../utils/system';
import { Sequelize } from 'sequelize';
import { WalletRepository } from '../repositories/wallet.repository';
import { Jwt } from '../utils/jwt';
import { sequelize } from '../core/boot';

const { Op } = Sequelize;

class WalletService {
  constructor() {
    this.walletRepository = new WalletRepository();
  }

  /**
   * @description Save wallet and generate token
   */
  async saveWalletAndGenerateToken({ wallet_address, wallet_type = 'ETH', network_id }) {
    let transaction;
    try {
      let wallet = await this.walletRepository.getOne({ wallet_address });
      if (!wallet) {
        transaction = await sequelize.transaction();
        wallet = await this.walletRepository.create({ wallet_address, wallet_type }, transaction);
      }

      const token = await Jwt.sign({
        wallet_id: wallet.wallet_id,
        wallet_address: wallet.wallet_address,
        wallet_type: wallet.wallet_type,
        network_id,
      });

      if (transaction) {
        await transaction.commit();
      }

      return jsonSuccess(token);
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      logger.error(`${new Date().toDateString()}_ERRORS_SAVE_WALLET_AND_GENERATE_TOKEN_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }
}

export const walletService = new WalletService();
