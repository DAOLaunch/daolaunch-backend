import { handleExceptionResponse } from '../../utils/system';
import { projectService } from '../../services/project.service';
import {
  authenticated,
  isProjectExisted,
  isValidNetworkId
} from '../../middlewares/policies';

import createProjectValidator from '../../validations/projects/createProjectValidator';

const ProjectController = require('express').Router();

ProjectController.base = 'project';

/**
 * @description create new project
 */
ProjectController.post('/', [
  authenticated(),
  isValidNetworkId(),
  createProjectValidator,
], async (req, res) => {
  try {
    const result = await projectService.createProject(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_CREATE_PROJECT_API', error);
  }
});

/**
 * @description Get list projects
 */
ProjectController.get('/', [
  authenticated(false),
], async (req, res) => {
  try {
    const result = await projectService.getListProject(req.body, req.query);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_LIST_PROJECT_API', error);
  }
});

/**
 * @description Get project by id
 */
ProjectController.get('/:id(\\d+)', [
  // authenticated(false),
], async (req, res) => {
  try {
    const result = await projectService.getProjectById(req.params);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_PROJECT_BY_ID_API', error);
  }
});

/**
 * @description Save transaction history
 */
ProjectController.post('/save-transaction', [
  authenticated(),
  isProjectExisted(),
], async (req, res) => {
  try {
    const result = await projectService.saveTransaction(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_SAVE_TRANSACTION_API', error);
  }
});

/**
 * @description Get participated project list
 */
ProjectController.get('/participated/list', [
  authenticated(),
], async (req, res) => {
  try {
    const result = await projectService.getParticipatedProjectList(req.body, req.query);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_PARTICIPATED_PROJECT_API', error);
  }
});

/**
 * @description Get statistic (total funding, participants, success percentage,...)
 */
ProjectController.get('/statistic', [
  authenticated(),
], async (req, res) => {
  try {
    const result = await projectService.getStatistic(req.body);
    res.json(result);
  } catch (error) {
    handleExceptionResponse(res, 'ERRORS_GET_STATISTIC_PROJECTS_API', error);
  }
});

export { ProjectController }
