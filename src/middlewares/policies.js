import { errors, handleExceptionResponse, jsonError } from '../utils/system';
import { Wallet } from '../models/schema/wallet.model';
import { Jwt } from '../utils/jwt';
import { NETWORK_LIST } from '../utils/constants';
import web3 from 'web3';
import { Network } from '../models/schema/network.model';
import { Project } from '../models/schema/project.model';

/**
 * Authenticate middleware used for admin token
 */
const authenticated = (isRequiredAuthorization = true) => {
  return async (req, res, next) => {
    try {
      const authorization = req.header('Authorization');

      /** In case api no need to authenticate */
      if (!isRequiredAuthorization && !authorization) {
        return next();
      }

      if (!authorization) {
        return res.json(jsonError(errors.NOT_AUTHENTICATED_ERROR));
      }

      // Decode token
      const decoded = await Jwt.verify(authorization);
      if (!decoded.success) {
        return res.json(decoded);
      }

      // req.principal = decoded.result;
      req.body.wallet = decoded.result;
      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_ADMIN_POLICIES_AUTHENTICATED_MIDDLEWARE', error);
    }
  };
};

const identifyWallet = () => {
  return async (req, res, next) => {
    try {
      const { id } = req.principal;
      const wallet = await Wallet.findByPk(id);

      if (!wallet) {
        return res.json(jsonError(errors.WALLET_NOT_FOUND));
      }

      req.body.wallet = wallet;
      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_IDENTIFY_WALLET_MIDDLEWARE', error);
    }
  }
}

const isChainIdValid = () => {
  return async (req, res, next) => {
    try {
      let { chain_id } = req.body
      chain_id = parseInt(chain_id, 16)

      // TODO query from db to check existed
      const checkValid = NETWORK_LIST.find(x => x.CHAIN_ID === chain_id);

      if (!checkValid) {
        return res.json(jsonError(errors.WALLET_NOT_FOUND));
      }

      req.body.chain_id = chain_id
      req.body.wallet_type = checkValid.CHAIN
      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_CHECK_CHAIN_ID_MIDDLEWARE', error);
    }
  }
}

const isWalletValid = () => {
  return async (req, res, next) => {
    try {
      const { chain_id, wallet_address } = req.body

      const check = web3.utils.isAddress(wallet_address, chain_id)

      if (!check) {
        return res.json(jsonError(errors.INVALID_WALLET));
      }

      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_CHECK_WALLET_MIDDLEWARE', error);
    }
  }
}

/**
 * @description Check is network_id from token is valid
 */
const isValidNetworkId = (isFromBody = false) => {
  return async (req, res, next) => {
    try {
      let network_id;
      if (isFromBody) {
        network_id = req.body.network_id;
      } else {
        network_id = req.body.wallet && req.body.wallet.network_id;
      }

      const isValid = await Network.findOne({
        where: { network_id }
      });

      if (!isValid) {
        return res.json(jsonError(errors.INVALID_NETWORK));
      }

      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_CHECK_WALLET_MIDDLEWARE', error);
    }
  }
}

/**
 * @description Check is project existed
 */
const isProjectExisted = (mustBeMyProject = false) => {
  return async (req, res, next) => {
    try {
      const { project_id = 0 } = req.body;
      const where = { project_id };

      if (mustBeMyProject) {
        const { wallet } = req.body;
        if (!wallet) {
          return jsonError(errors.NOT_AUTHENTICATED_ERROR);
        }

        where.wallet_id = wallet.wallet_id;
      }

      if (!project_id) {
        return res.json(jsonError(errors.PROJECT_NOT_FOUND));
      }

      const project = await Project.findOne({
        where,
      });

      if (!project) {
        return res.json(jsonError(errors.PROJECT_NOT_FOUND));
      }

      req.body.project = project;
      return next();
    } catch (error) {
      handleExceptionResponse(res, 'ERRORS_CHECK_IS_PROJECT_EXISTED_MIDDLEWARE', error);
    }
  }
}

export {
  authenticated,
  identifyWallet,
  isChainIdValid,
  isWalletValid,
  isValidNetworkId,
  isProjectExisted,
}
