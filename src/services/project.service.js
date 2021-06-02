import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Sequelize } from 'sequelize';
import { sequelize } from '../core/boot';
import { NETWORK_TYPE } from '../models/schema/network.model';
import { Presale } from '../models/schema/presale.model';
import { calculateTotalTokensSold, Project, TOKEN_SALE_TYPE } from '../models/schema/project.model';
import { ACCESS_TYPE, Sale } from '../models/schema/sale.model';
import { Wallet } from '../models/schema/wallet.model';
import { Whitelist } from '../models/schema/whitelist.model';
import { PresaleRepository } from '../repositories/presale.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { SaleRepository } from '../repositories/sale.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { WhitelistRepository } from '../repositories/whitelist.repository';
import { apiGet } from '../utils/request';
import { errors, jsonError, jsonSuccess, logger } from '../utils/system';
import { presaleService } from './presale.service';

const { Op } = Sequelize;

class ProjectService {
  constructor() {
    this.projectRepository = new ProjectRepository();
    this.saleRepository = new SaleRepository();
    this.whitelistRepository = new WhitelistRepository();
    this.transactionRepository = new TransactionRepository();
    this.presaleRepository = new PresaleRepository();
  }

  /**
   * @description create project service
   */
  async createProject(
    {
      wallet,
      /** Project */
      project_logo,
      project_name,
      project_website,
      project_email,
      project_white_paper,
      project_additional_info,
      project_twitter,
      project_telegram,
      project_medium,
      project_discord,
      token_contract_address,
      token_name,
      token_symbol,
      token_decimal,
      payment_currency,
      list_amm,
      currency_pair,
      contract_address,
      /** Sale */
      wallet_token_balance,
      sale_allocation,
      swap_ratio,
      hard_cap,
      soft_cap,
      max_allocation_wallet_limit,
      max_allocation_wallet,
      min_allocation_wallet_limit,
      min_allocation_wallet,
      access_type,
      sale_start_time,
      sale_end_time,
      listing_rate,
      initial_liquidity_per,
      listing_time,
      lock_liquidity,
      est_funding,
      /** White list */
      whitelist = [],
    }
  ) {
    let transaction;
    try {
      const isContractAddressSuccessOrLiveUpcoming = await this.checkIsContractAddressSuccessOrLiveUpcoming(token_contract_address);
      if (isContractAddressSuccessOrLiveUpcoming) {
        return jsonError(errors.CONTRACT_ADDRESS_IS_LIVE_OR_UPCOMING);
      }

      transaction = await sequelize.transaction();

      const project = await this.projectRepository.create({
        wallet_id: wallet.wallet_id,
        network_id: wallet.network_id,
        project_logo,
        project_name,
        project_website,
        project_email,
        project_white_paper,
        project_additional_info,
        project_twitter,
        project_telegram,
        project_medium,
        project_discord,
        token_contract_address,
        token_name,
        token_symbol,
        token_decimal,
        payment_currency,
        list_amm,
        currency_pair,
        contract_address,
      }, transaction);

      const sale = await this.saleRepository.create({
        project_id: project.project_id,
        wallet_token_balance,
        sale_allocation: sale_allocation.toString(),
        swap_ratio: swap_ratio.toString(),
        hard_cap: hard_cap.toString(),
        soft_cap: soft_cap.toString(),
        max_allocation_wallet_limit,
        max_allocation_wallet: max_allocation_wallet_limit && max_allocation_wallet,
        min_allocation_wallet_limit,
        min_allocation_wallet: min_allocation_wallet_limit && min_allocation_wallet,
        access_type,
        sale_start_time,
        sale_end_time,
        listing_rate,
        initial_liquidity_per,
        listing_time,
        lock_liquidity,
        est_funding,
      }, transaction);

      /** Insert white_lists when access type is private only */
      if (access_type === ACCESS_TYPE.PRIVATE && whitelist.length) {
        const whitelistAttributes = whitelist.map(item => {
          return {
            sale_id: sale.sale_id,
            whitelist_wallet_address: item,
          }
        });

        await this.whitelistRepository.bulkCreate(whitelistAttributes, transaction);
      }

      await transaction.commit();

      return jsonSuccess();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      logger.error(`${new Date().toDateString()}_ERRORS_CREATE_PROJECT_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Get list project service
   * @param {Object|null} wallet
   * @param {string} time
   * @param {string} get_my_project
   */
  async getListProject({ wallet = null }, { time = '', get_my_project }) {
    try {
      const condition = {};
      const now = new Date();

      /** If get my project */
      if (get_my_project === 'true') {
        if (!wallet) {
          return jsonError(errors.NOT_AUTHENTICATED_ERROR);
        }

        condition.wallet_id = wallet.wallet_id;
        condition.network_id = wallet.network_id;
      } else {
        /** Network condition */
        if (!wallet) {
          // /** Get main network project if not logged-in */
          // condition.network_id = { [Op.in]: NETWORK_TYPE.MAINS };
          return jsonSuccess({
            count: 0,
            rows: []
          });
        } else if (wallet.network_id) {
          /** Get chose network project if logged-in */
          condition.network_id = wallet.network_id;
        }

        /** Time condition (upcoming, live, close) */
        switch (time) {
          case TOKEN_SALE_TYPE.LIVE:
            condition['$sale.sale_start_time$'] = { [Op.lte]: moment(now).toDate() };
            condition['$sale.sale_end_time$'] = { [Op.gte]: now };
            break;
          case TOKEN_SALE_TYPE.UPCOMING:
            condition['$sale.sale_start_time$'] = { [Op.gte]: moment(now).toDate() };
            break;
          case TOKEN_SALE_TYPE.CLOSED:
            condition['$sale.sale_end_time$'] = { [Op.lte]: now };
            break;
          default:
            break;
        }
      }

      const result = await this.projectRepository.getAll({
        condition,
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
      }).then(res => JSON.parse(JSON.stringify(res)));

      const projectStatuses = await Promise.all(
        result.rows.map(project => {
          if (project.presale) {
            return null;
          }

          return presaleService.getPresaleStatus({
            contract_address: project.contract_address,
            network_id: project.network_id,
            project_id: project.project_id,
          });
        })
      );

      result.rows.forEach((project, index) => {
        if (!project.presale) {
          const status = projectStatuses[index];
          project.presale = status.success ? status.result : null
        }

        if (now >= moment(project.sale.sale_end_time)) {
          project.isClosed = true;
        }
      });

      return jsonSuccess(result);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_LIST_PROJECT_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Get project by id
   */
  async getProjectById({ id }) {
    try {
      const result = await this.projectRepository.getById(id, {
        include: [
          {
            model: Sale,
            as: 'sale',
            include: {
              model: Whitelist,
              as: 'white_lists'
            }
          },
          {
            model: Wallet,
            as: 'wallet'
          },
          {
            model: Presale,
            as: 'presale'
          }
        ]
      });

      if (!result) {
        return jsonError(errors.PROJECT_NOT_FOUND);
      }

      if (!result.presale) {
        const projectStatus = await presaleService.getPresaleStatus({
          contract_address: result.contract_address,
          network_id: result.network_id,
          project_id: result.project_id,
        });

        result.presale = projectStatus.success ? projectStatus.result : null;
      }

      return jsonSuccess(result);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_PROJECT_BY_ID_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Save transaction history
   * @param wallet {Object}
   * @param project_id {Number}
   */
  async saveTransaction({ wallet, project_id }) {
    try {
      const existedTransaction = await this.transactionRepository.getOne({
        wallet_id: wallet.wallet_id,
        project_id,
      })
      if (!existedTransaction) {
        await this.transactionRepository.create({
          wallet_id: wallet.wallet_id,
          project_id,
        });
      }

      return jsonSuccess();
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_SAVE_TRANSACTION_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Get participated project list
   */
  async getParticipatedProjectList({ wallet }, { page, limit }) {
    try {
      const distinctParticipatedProjectIds = await this.transactionRepository.findAll({
        page: +page,
        limit: +limit,
        attributes: ['project_id'],
        group: ['project_id'],
        condition: {
          wallet_id: wallet.wallet_id,
          '$project.network_id$': wallet.network_id,
        },
        include: {
          model: Project,
          as: 'project',
        },
        order: []
      });

      const result = await this.projectRepository.getAll({
        page: +page,
        limit: +limit,
        condition: { project_id: { [Op.in]: distinctParticipatedProjectIds.map(item => item.project_id) } },
        include: [
          {
            model: Sale,
            as: 'sale'
          },
          {
            model: Presale,
            as: 'presale'
          },
        ]
      }).then(res => JSON.parse(JSON.stringify(res)));

      const buyers = await Promise.all(
        result.rows.map(project => presaleService.getBuyerInfo({
          wallet,
          project,
        }))
      );

      const projectStatuses = await Promise.all(
        result.rows.map(item => {
          if (item.presale) {
            return null
          }

          return presaleService.getPresaleStatus({
            contract_address: item.contract_address,
            network_id: item.network_id,
          })
        })
      );

      result.rows.forEach((item, index) => {
        item.buyer = buyers[index].result;
        if (!item.presale) {
          item.presale = projectStatuses[index].success ? projectStatuses[index].result : null;
        }
      });

      return jsonSuccess(result);
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_PARTICIPATED_PROJECTS_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Get my project statistic
   * @param wallet
   */
  async getStatistic({ wallet }) {
    try {
      const condition = {
        wallet_id: wallet.wallet_id,
        network_id: wallet.network_id,
      }

      const projects = await this.projectRepository.findAll({
        condition,
        include: [
          {
            model: Sale,
            as: 'sale',
          },
          {
            model: Presale,
            as: 'presale',
          }
        ]
      }).then(res => JSON.parse(JSON.stringify(res)));

      const presales = await Promise.all(
        projects.map(project => {
          if (project.presale) {
            return null;
          }

          return presaleService.getPresaleStatus({
            contract_address: project.contract_address,
            network_id: project.network_id,
            project_id: project.project_id,
          });
        })
      );

      const prices = await Promise.all(
        projects.map((project, index) => {
          if (project.presale) {
            return null;
          }

          return this.getProjectPrice({
            payment_currency: project.payment_currency,
            amount: presales[index].success ? presales[index].result.total_base_collected : 0,
          })
        })
      );

      let participants = 0;
      const totalProjects = {
        closed: 0,
        success: 0,
        liveAndUpcoming: 0,
      };

      const now = moment().valueOf();

      projects.forEach((project, index) => {
        if (!project.presale) {
          const findPresale = presales[index];
          project.presale = findPresale.success ?
            {
              ...findPresale.result,
              price: prices[index],
            }
            :
            null;
        }

        const { number_buyers = 0, total_base_collected = 0 } = project.presale || {};
        participants += +number_buyers;
        if (now >= moment(project.sale.sale_end_time)) {
          project.isClosed = true;
          totalProjects.closed += 1;

          const totalTokenSold = calculateTotalTokensSold(project.payment_currency, total_base_collected);
          const softCap = +project.sale.soft_cap;
          if (totalTokenSold >= softCap) {
            totalProjects.success += 1;
            project.is_success = true;
          } else {
            project.is_success = false;
          }
        } else {
          totalProjects.liveAndUpcoming += 1;
        }
      })

      /** Save presale status into database if project closed */
      await this.savePresaleIntoDatabase({
        projects,
        presales,
      });

      const totalFunding = projects.reduce((res, project) => project.presale && project.is_success
        ? new BigNumber(res).plus(project.presale.price)
        : res
        , 0);

      return jsonSuccess({
        participants,
        totalProjects,
        totalFunding,
      })
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_STATISTIC_PROJECTS_SERVICE`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /********** FUNCTIONS IN SERVICE **********/

  /**
   * @description Save presale status into database (project must include isClosed field)
   * @param {Array<Project>} projects
   * @param {Array<{ success: boolean, result: Object, error: Object }>}  presales
   */
  async savePresaleIntoDatabase({ projects, presales }) {
    const transaction = await sequelize.transaction();
    try {
      await Promise.all(
        presales.reduce((arr, cur, index) => {
          if (cur && cur.success) {
            const responsePresale = cur.result;

            const findProject = projects[index];

            if (findProject && findProject.isClosed) {
              arr.push(this.presaleRepository.create({
                project_id: responsePresale.project_id,
                total_tokens_sold: responsePresale.TOTAL_TOKENS_SOLD,
                total_base_collected: responsePresale.TOTAL_BASE_COLLECTED,
                number_buyers: responsePresale.NUM_BUYERS,
                is_added_liquidity: responsePresale.ADDED_LIQUIDITY,
                is_force_failed: responsePresale.FORCE_FAILED,
                is_transferred_fee: responsePresale.IS_TRANSFERED_FEE,
                is_list_on_uniswap: responsePresale.LIST_ON_UNISWAP,
                total_base_withdrawn: responsePresale.TOTAL_BASE_WITHDRAWN,
                total_tokens_withdrawn: responsePresale.TOTAL_TOKENS_WITHDRAWN,
                is_whitelist_only: responsePresale.WHITELIST_ONLY,
                is_owner_withdrawn: responsePresale.IS_OWNER_WITHDRAWN,
                price: findProject.presale.price,
                is_success: findProject.is_success,
              }, transaction))
            }
          }

          return arr;
        }, [])
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(`${new Date().toDateString()}_ERRORS_SAVE_PRESALES_FUNCTION`, error);
      throw error;
    }
  }

  /**
   * @description Get current ratio to get price
   * @param payment_currency
   * @param amount
   */
  async getProjectPrice({ payment_currency, amount }) {
    try {
      if (amount === '0') return 0;
      let decimals = payment_currency === 'USDT' ? 6 : 18;
      decimals = new BigNumber(10).pow(decimals);

      amount = new BigNumber(amount).dividedBy(decimals).toString(10);
      const url = `https://pro-api.coinmarketcap.com/v1/tools/price-conversion?amount=${amount}&symbol=${payment_currency}`;
      const headers = { ['X-CMC_PRO_API_KEY']: 'f6eae3aa-42ca-4c7b-848e-0381f4aa76ff' };
      const request = await apiGet({ url, headers });
      return request.data && request.data.quote && request.data.quote.USD && request.data.quote.USD.price || 0;
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_GET_PROJECT_PRICE_FUNCTION`, error);
      throw error;
    }
  }

  /**
   * @description Check is contract address is sold and upcoming/live or success
   * @param {String} token_contract_address
   */
  async checkIsContractAddressSuccessOrLiveUpcoming(token_contract_address) {
    try {
      const successOrLiveUpcomingProjects = await this.projectRepository.findAll({
        condition: {
          token_contract_address,
        },
        include: [
          {
            model: Sale,
            as: 'sale',
          },
          {
            model: Presale,
            as: 'presale',
          },
        ],
      }).then(res => JSON.parse(JSON.stringify(res)));

      const now = moment.utc().format();

      let result = false;
      for (const project of successOrLiveUpcomingProjects) {
        if (moment(project.sale.sale_end_time).isAfter(now)) {
          result = true;
          break;
        } else {
          if (project.presale) {
            if (project.presale.is_success) {
              result = true;
            }
          } else {
            const presale = await presaleService.getPresaleStatus({
              contract_address: project.contract_address,
              network_id: project.network_id,
            });
            if (!presale.success) {
              result = true;
              break;
            }

            const { TOTAL_BASE_COLLECTED } = presale.result;

            const totalTokenSold = calculateTotalTokensSold(project.payment_currency, TOTAL_BASE_COLLECTED);
            const softCap = +project.sale.soft_cap;
            if (totalTokenSold >= softCap) {
              result = true;
              break;
            }
          }
        }
      }

      return result;
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_CHECK_IS_CONTRACT_ADDRESS_SUCCESS_OR_LIVE_UPCOMING_FUNCTION`, error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
