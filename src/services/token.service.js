import { errors, jsonError, jsonSuccess, logger } from '../utils/system';
import { Sequelize } from 'sequelize';
import { TokenRepository } from '../repositories/token.repository';
import Web3 from 'web3';
import {
  BUSD_ABI,
  CONTRACT_ABI,
  CURRENCY,
  NETWORK_ID_LIST,
  NETWORK_LIST,
  NOT_LISTED_UNISWAP_DATA_RESULT,
  PROVIDERS,
  USDT_ABI
} from '../utils/constants';
import data from '../block-chain/service/data';
import { Wallet, WALLET_TYPE } from '../models/schema/wallet.model';
import BigNumber from 'bignumber.js';
import { contracts } from '../utils/compiles';
import { TRANSACTION_STATUS } from '../models/schema/token.model';
import { ProjectRepository } from '../repositories/project.repository';
import { Sale } from '../models/schema/sale.model';
import { projectService } from './project.service';
import { exchangeService } from './uniswap.service';
import { sequelize } from '../core/boot';

const { Op } = Sequelize;

class TokenService {
  constructor() {
    this.tokenRepository = new TokenRepository();
    this.projectRepository = new ProjectRepository();
  }

  /**
   * @description Save wallet and generate token
   */
  async createToken(
    {
      wallet,
      token_name,
      token_symbol,
      token_supply,
      token_decimal_place,
      token_contract_address,
      token_transaction_hash,
    }
  ) {
    try {
      const newToken = await this.tokenRepository.create({
        wallet_id: wallet.wallet_id,
        network_id: wallet.network_id,
        token_name,
        token_symbol,
        token_supply,
        token_decimal_place: token_decimal_place.toString(),
        token_contract_address,
        token_transaction_status: TRANSACTION_STATUS.PENDING,
        token_transaction_hash,
      });

      return jsonSuccess(newToken);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_CREATE_TOKEN_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  async getMyTokens({ wallet }, { limit, page }) {
    let transaction;
    try {
      const unCompletedTokens = await this.tokenRepository.findAll({
        condition: {
          wallet_id: wallet.wallet_id,
          token_transaction_status: TRANSACTION_STATUS.PENDING,
          token_transaction_hash: { [Op.ne]: null },
          network_id: wallet.network_id,
        }
      });

      if (unCompletedTokens && unCompletedTokens.length > 0) {
        const ethMainNetKey = 'https://mainnet.infura.io/v3/6f91a6ef31a448bb917663fed3a5fd72';
        const ropstenKey = 'https://ropsten.infura.io/v3/6f91a6ef31a448bb917663fed3a5fd72';
        const kovanKey = getEnv('KOVAN_KEY') || 'https://kovan.infura.io/v3/c89e5dd56f704c38b8dcac0bb6cce0fe';
        const rinkebyKey = 'https://rinkeby.infura.io/v3/6f91a6ef31a448bb917663fed3a5fd72';
        const goerliKey = 'https://goerli.infura.io/v3/6f91a6ef31a448bb917663fed3a5fd72';
        const bscMain = 'https://bsc-dataseed.binance.org'
        const bscTestNet = 'https://data-seed-prebsc-1-s1.binance.org:8545/'

        const web3EthMain = new Web3(ethMainNetKey);
        const web3Ropsten = new Web3(ropstenKey);
        const web3Kovan = new Web3(kovanKey);
        const web3Rinkeby = new Web3(rinkebyKey);
        const web3Goerli = new Web3(goerliKey);
        const web3BscMain = new Web3(bscMain);
        const web3BscTestnet = new Web3(bscTestNet);

        await Promise.all(
          unCompletedTokens.map(x => {
            if (x.token_transaction_hash) {
              switch (x.network_id) {
                case NETWORK_ID_LIST.ETH:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3EthMain })
                case NETWORK_ID_LIST.ROPSTEN:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3Ropsten })
                case NETWORK_ID_LIST.KOVAN:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3Kovan })
                case NETWORK_ID_LIST.RINKEBY:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3Rinkeby })
                case NETWORK_ID_LIST.GOERLI:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3Goerli })
                case NETWORK_ID_LIST.BSC_MAINNET:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3BscMain })
                case NETWORK_ID_LIST.BSC_TESTNET:
                  return this.getTokenTransactionReceipt({ wallet, token: x, web3Instance: web3BscTestnet })
                default:
                  break;
              }
            }
          })
        )
      }

      const tokens = await this.tokenRepository.getAll({
        page: +page,
        limit: +limit,
        condition: {
          wallet_id: wallet.wallet_id,
          network_id: wallet.network_id,
          token_transaction_status: TRANSACTION_STATUS.COMPLETED
        },
        raw: true,
      });

      transaction = await sequelize.transaction();

      /** Check is listed on uniswap eth */
      const checkList = ['ETH', 'USDT', 'BNB', 'BUSD'];
      tokens.rows = await Promise.all(
        tokens.rows.map(async token => {
          let updateUniswapData = token.uniswap_list;

          /** Check is list in uniswap or pancakeswap */
          for (const net of checkList) {
            if (!updateUniswapData.includes(net)) {
              const isListedUniswapEth = await exchangeService.getFair({
                sale_token: token.token_contract_address,
                network_id: token.network_id,
                base_token: net,
              });

              if (isListedUniswapEth.success && isListedUniswapEth.result !== NOT_LISTED_UNISWAP_DATA_RESULT) {
                updateUniswapData = updateUniswapData + `${net},`;
              }
            }
          }

          if (token.uniswap_list !== updateUniswapData) {
            token.uniswap_list = updateUniswapData;
            await this.tokenRepository.updateById(
              token.token_id,
              { uniswap_list: token.uniswap_list },
              transaction,
            );
          }
          return token;
        })
      );

      await transaction.commit();

      return jsonSuccess(tokens);
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      logger.error(`${new Date().toDateString()}_ERRORS_GET_MY_TOKENS_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  async getTokenTransactionReceipt({ wallet, token, web3Instance }) {
    try {
      const info = await web3Instance.eth.getTransactionReceipt(token.token_transaction_hash)

      if (info && info.blockHash) {
        if (info.status === false) {
          return await this.tokenRepository.updateOne(
            {
              wallet_id: wallet.wallet_id,
              token_transaction_status: TRANSACTION_STATUS.FAILED,
              token_contract_address: info.contractAddress,
            },
            {
              token_id: token.token_id
            },
          )
        }

        return await this.tokenRepository.updateOne(
          {
            wallet_id: wallet.wallet_id,
            token_transaction_status: TRANSACTION_STATUS.COMPLETED,
            token_contract_address: info.contractAddress,
          },
          {
            token_id: token.token_id
          },
        )
      }
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_TRANSACTION_RECEIPT_FUNCTION`, error);
      throw error
    }
  }

  /**
   * @description Get detail of token address
   * @param {String} address
   * @param {Object} wallet
   * @param {String} is_valid_address
   */
  async getDetailOfTokenByAddress({ address }, { wallet }, { is_valid_address, spender }) {
    try {
      if (!wallet) {
        const project = await this.projectRepository.getOne(
          {
            token_contract_address: address,
          },
          {
            include: {
              model: Wallet,
              as: 'wallet',
            },
          },
        )

        if (project && project.wallet) {
          const result = await this.tokenDetailProcessingWithAddress(address, project.wallet.wallet_address, project.wallet.network_id)
          return jsonSuccess(result)
        }
        return jsonSuccess({})
      }

      const dataToken = await this.tokenDetailProcessingWithAddress(address, wallet.wallet_address, wallet.network_id);

      if (is_valid_address === 'true') {
        dataToken.isSuccessOrLiveUpcoming = await projectService.checkIsContractAddressSuccessOrLiveUpcoming(address);
      }

      const contract = this.getWeb3WithProvider(contracts.getERC20Interface(), address, wallet.network_id);
      const tokens_approved = await contract.methods.allowance(
        wallet.wallet_address,
        spender
      ).call();

      return jsonSuccess(
        {
          ...dataToken,
          tokens_approved,
        }
      );
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_TOKENS_DETAIL_BY_ADDRESS_SERVICE`, error);
      return jsonError(errors.INVALID_TOKEN_ADDRESS);
    }
  }

  async generateTokenData({ wallet, token_name, token_decimal_place, token_supply, token_symbol }) {
    try {
      let token_data

      const { network_id, wallet_address } = wallet

      const bigNumber = new BigNumber(10).pow(token_decimal_place).multipliedBy(token_supply).toString(16);
      const numAsHex = "0x" + bigNumber;

      if (wallet.wallet_type === WALLET_TYPE.ETH) {
        token_data = await data.getERC20Data([token_name, token_symbol, token_decimal_place, numAsHex], network_id, wallet_address)
      } else if (wallet.wallet_type === WALLET_TYPE.BSC) {
        token_data = await data.getBEP20Data([token_name, token_symbol, token_decimal_place, numAsHex], network_id, wallet_address)
      }

      return jsonSuccess({
        data: token_data.data,
        gas: '0x' + BigNumber(token_data.gas).toString(16)
      });
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_TOKEN_DATA_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  async getApproveTokenData({ contractAddress, networkId, spender, amount, fromAddress }) {
    try {
      const contract = this.getWeb3WithProvider(contracts.getERC20Interface(), contractAddress, networkId);
      const approve = contract.methods.approve(spender, amount);
      const gas = await approve.estimateGas({ from: fromAddress });
      return jsonSuccess({
        data: approve.encodeABI(),
        gas: Web3.utils.toHex(gas)
      })
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_APPROVE_TOKEN_DATA_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  async getUSDTBalance({ wallet }) {
    try {
      let abi;
      let decimals;
      let contractAddr;
      if ([56, 97].includes(wallet.network_id)) {
        abi = BUSD_ABI;
        decimals = new BigNumber(10).pow(18).toString(10);
        contractAddr = CURRENCY[wallet.network_id]['BUSD'];
      } else {
        abi = USDT_ABI;
        decimals = new BigNumber(10).pow(6).toString(10);
        contractAddr = CURRENCY[wallet.network_id]['USDT'];
      }

      const contract = this.getWeb3WithProvider(abi, contractAddr, wallet.network_id);
      const balanceOf = await contract.methods.balanceOf(wallet.wallet_address).call();
      return jsonSuccess({
        balance: new BigNumber(balanceOf).toString(10),
        adjustedBalance: new BigNumber(balanceOf).dividedBy(decimals).toString(10),
      });
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_USED_BALANCE_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**** FUNCTIONS IN SERVICE ******/
  getWeb3WithProvider(abi, address, networkId) {
    const provider = PROVIDERS[networkId] || 0;
    if (provider === 0) throw new Error('INVALID_NETWORK_ID');

    const web3Instance = new Web3(Web3.givenProvider || provider);
    return new web3Instance.eth.Contract(abi, address);
  }

  async tokenDetailProcessingWithAddress(address, wallet_address, network_id) {
    try {
      const network = NETWORK_LIST.find(net => net.NETWORK_ID === network_id);

      const web3 = new Web3(network.NODE_RPC);

      const projects = await this.projectRepository.findAll({
        condition: { token_contract_address: address },
        include: {
          model: Sale,
          as: 'sale',
        },
      })

      let totalUsed = 0
      projects.forEach(project => {
        if (project.sale && project.sale.sale_allocation) {
          totalUsed += +project.sale.sale_allocation
        }
      })

      const tokenContract = new web3.eth.Contract(CONTRACT_ABI, address)

      const [
        decimal,
        balance,
        tokenName,
        tokenSymbol,
        totalSupply,
      ] = await Promise.all([
        tokenContract.methods.decimals().call(),
        tokenContract.methods.balanceOf(wallet_address).call(), // wallet address
        tokenContract.methods.name().call(),
        tokenContract.methods.symbol().call(),
        tokenContract.methods.totalSupply().call(),
      ]);

      const adjustedBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimal));

      return {
        decimal,
        balance,
        adjustedBalance,
        tokenName,
        tokenSymbol,
        totalSupply: new BigNumber(totalSupply).dividedBy(Math.pow(10, decimal)).toString(10),
        balanceNotOnSale: +adjustedBalance - totalUsed
      };

    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_TOKEN_DETAIL_PROCESSING_FUNCTION`, error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();
