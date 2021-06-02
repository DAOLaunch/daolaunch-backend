import { handleExceptionResponse } from '../../utils/system';
import { networkService } from '../../services/network.service';

const NetworkController = require('express').Router();

NetworkController.base = 'network';

/**
 * @description create new project
 */
NetworkController.get('/init', async (req, res) => {
  try {
    const result = await networkService.init();
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_INIT_NETWORK_API', error);
  }
});

export { NetworkController }
