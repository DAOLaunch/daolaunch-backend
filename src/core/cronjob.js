import cron from 'node-cron';
import { logger } from '../utils/system';
import { Project } from '../models/schema/project.model';
import { Sale } from '../models/schema/sale.model';
import { Presale } from '../models/schema/presale.model';
import { Sequelize } from 'sequelize';
const { Op } = Sequelize;
const Tx = require('ethereumjs-tx');
import { PROVIDERS, NETWORK_LIST, NETWORK_ID_LIST } from '../utils/constants';
import Web3 from 'web3';
import { contracts } from '../utils/compiles';
import { errors, jsonError, jsonSuccess } from '../utils/system';
import { apiGet } from '../utils/request';

class Cronjob {
  constructor() {}

  async getClosedProject() {
    try {
      let condition = {};
      const now = new Date();

      condition['$sale.sale_end_time$'] = { [Op.lte]: now };
      condition['is_list_on_uniswap'] = { [Op.is]: null };
      condition['is_transfer_daolaunch_fee'] = { [Op.is]: null };

      const projects = await Project.findAll({
        where: condition,
        include: [
          {
            model: Sale,
            as: 'sale',
          },
          {
            model: Presale,
            as: 'presale'
          },
        ],
        raw: true,
      });

      // get first 10 project
      if (projects.length === 0) return;
      
      const MAX_PROJECT = 20;
      let projectIndex = 0;
      
      for (const project of projects) {
        // get presale status
        const status = await this.presaleStatus({ 
          contract_address: project.contract_address,
          network_id: project.network_id, 
        });
        if (status === '2') {
          console.log('project_id', project.project_id);
          // success
          // list on Uniswap or Pancake
          const today = new Date().getTime();
          const listing_date = new Date(project['sale.listing_time']).getTime() + 10000; // add 10s
          
          if (today < listing_date) continue;
          
          const res = await this.getListOnUniswapData( { project });
          if (res && res.transactionHash) {
            let transaction;
            while(!transaction) {
              transaction = await this.getTransactionReceipt(res.transactionHash, project.network_id);
              if (transaction) break;
            }

            // get pair address
            const log = transaction.logs.find(log => log.topics.includes('0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'));
            const { data, topics } = log;
            const pair_address = await this.getPairAddress(data, topics.slice(1));

            // update project
            Project.update({ is_list_on_uniswap: true, pair_address }, { where: { project_id: project.project_id }});
            projectIndex++;
            console.log('List on Uniswap or Pancakeswap successfully');
            
          }
        } else if (status === '3') {
          // failed
          // transfer DAOLaunch fee
          console.log('project_id', project.project_id);
          const res = await this.sendDAOLaunchFee( { project });
          if (res && res.blockHash) {
            // update project
            Project.update({ is_transfer_daolaunch_fee: true }, { where: { project_id: project.project_id }});
            projectIndex++;
            console.log('Send DAOLaunch fee successfully');
          }
        }

        if (projectIndex === MAX_PROJECT) return;
      }
    } catch (error) {
      console.log('error:', error);
    }
  }

  async updateCoinRatio() {
    try {
      await this.getClosedProject();
      
      console.log('TODO: do some logic here to list project on uniswap');
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_CRONJOB_LIST_ON_UNISWAP_CRONJOB_FAILED`, error);
      throw error;
    }
  }

  updateRatioCronJob() {
    cron.schedule(getEnv('UPDATE_COIN_RATIO_CRONJOB_INTERVAL'), async () => {
      logger.verbose('-----LIST ON UNISWAP-----');
      await this.updateCoinRatio();
    });
  }

  async runCronJob() {
    await this.updateRatioCronJob();
  }

  async sendDAOLaunchFee({ project }) {
    try {
      const { contract_address, network_id } = project;
      const contract = this.getWeb3WithProvider(contracts.getPresaleInterface(), contract_address, network_id.toString());
      const sendDAOLaunchFee = contract.methods.sendDAOLaunchFee();

      const web3Instance = this.getWeb3(network_id);
      const nonce = await web3Instance.eth.getTransactionCount(getEnv('CALLER_ADDR'));
      let gasPrice = await this.getGasPrice({ network_id });
      gasPrice = gasPrice && gasPrice.result && gasPrice.result.result;

      return await this.sendRawTransaction(
        web3Instance, 
        getEnv('CALLER_PRIV'), 
        nonce, 
        gasPrice, 
        '0x186A0', // 100000 wei
        contract_address, 
        '0x0', 
        sendDAOLaunchFee.encodeABI()
      );
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_SEND_DAOLAUNCH_FEE_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @note THIS FUNCTION IS USED IN OTHER SERVICES, PLEASE CHECK CAREFULLY BEFORE EDIT
   * @description Get presale status
   * @param contract_address {String} presale contract address
   * @param network_id {String} network id
   * @param project_id {Number}
   */
  async presaleStatus({ contract_address, network_id }) {
    try {
      const contract = this.getWeb3WithProvider(contracts.getPresaleInterface(), contract_address, network_id.toString());

      return await contract.methods.presaleStatus().call();
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_PRESALE_STATUS_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  async sendRawTransaction(web3, privateKey, nonce, gasPrice, gasLimit, to, value, data) {
    try {
      // build transaction
      const rawTx = {
        nonce,
        gasPrice,
        gasLimit,
        to,
        value,
        data
      };

      const tx = new Tx(rawTx);

      // sign transaction
      tx.sign(Buffer.from(privateKey, 'hex'));
      const serializedTx = tx.serialize();

      // send transaction
      return await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_SEND_RAW_TRANSACTION`, error);
      throw error;
    }
  }

  /**
   * @description Get list on Uniswap data
   * @param {Object} wallet
   * @param {Object} project
   */
  async getListOnUniswapData({ project }) {
    try {
      const { contract_address, network_id } = project
      const contract = this.getWeb3WithProvider(contracts.getPresaleInterface(), contract_address, network_id.toString());

      const listOnUniswap = contract.methods.listOnUniswap();

      const web3Instance = this.getWeb3(network_id);
      const nonce = await web3Instance.eth.getTransactionCount(getEnv('CALLER_ADDR'));
      let gasPrice = await this.getGasPrice({ network_id });
      gasPrice = gasPrice && gasPrice.result && gasPrice.result.result;

      return await this.sendRawTransaction(
        web3Instance, 
        getEnv('CALLER_PRIV'), 
        nonce, 
        gasPrice, 
        '0x401640', // 4200000 wei 
        contract_address, 
        '0x0', 
        listOnUniswap.encodeABI()
      );
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_LIST_ON_UNISWAP_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  getWeb3(networkId) {
    try {
      const provider = PROVIDERS[networkId];
      if (!provider) {
        throw errors.INVALID_NETWORK;
      }

      return new Web3(Web3.givenProvider || provider);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_WEB3_FUNCTION`, error);
      throw error;
    }
  }

  /**
   * 
   * @param {String} abi 
   * @param {String} address 
   * @param {String} networkId 
   */
  getWeb3WithProvider(abi, address, networkId) {
    try {
      const web3Instance = this.getWeb3(networkId);
      return new web3Instance.eth.Contract(abi, address);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_WEB3_WITH_PROVIDER_FUNCTION`, error);
      throw error;
    }
  }

  /**
   * @description Get gas prices
   * @return {Object} network_id
   */
  async getGasPrice({ network_id }) {
    try {
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
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  async getTransactionReceipt(tx_hash, network_id) {
    const web3Instance = this.getWeb3(network_id);
    return await web3Instance.eth.getTransactionReceipt(tx_hash);
  }

  async getPairAddress(log, topics) {
    try {
      let abi = {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "token0",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "token1",
            type: "address",
          },
          {
            indexed: false,
            internalType: "address",
            name: "pair",
            type: "address",
          },
          { indexed: false, internalType: "uint256", name: "", type: "uint256" },
        ],
        name: "PairCreated",
        type: "event",
      };

      const web3 = new Web3();
      const result = web3.eth.abi.decodeLog(abi.inputs, log, topics);
      return result.pair;
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_PAIR_ADDRESS_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }
}

export const cronJob = new Cronjob();
