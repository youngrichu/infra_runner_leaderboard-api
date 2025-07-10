const Joi = require('joi');

const submitScoreSchema = Joi.object({
  playerName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  organizationName: Joi.string().min(1).max(255).required(),
  score: Joi.number().integer().min(0).required(),
  gameDuration: Joi.number().integer().min(0).required(),
  blueprintsCollected: Joi.number().integer().min(0).default(0),
  waterDropsCollected: Joi.number().integer().min(0).default(0),
  energyCellsCollected: Joi.number().integer().min(0).default(0)
});

const queryParamsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  email: Joi.string().email(),
  organizationName: Joi.string().min(1).max(255)
});

module.exports = {
  submitScoreSchema,
  queryParamsSchema
};