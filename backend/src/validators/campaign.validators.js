const { body } = require('express-validator');

const createCampaignValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre de la campaña es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('rulesetId')
    .isInt({ min: 1 }).withMessage('El ruleset seleccionado no es válido'),
];

const joinCampaignValidators = [
  body('campaignId')
    .trim()
    .notEmpty().withMessage('El ID de campaña es requerido'),
];

module.exports = { createCampaignValidators, joinCampaignValidators };
