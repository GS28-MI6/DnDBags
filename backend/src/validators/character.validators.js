const { body } = require('express-validator');

const characterValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del personaje es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
];

const addItemValidators = [
  body('itemSource')
    .isIn(['base', 'custom', 'override']).withMessage('Fuente de ítem inválida'),
  body('itemId')
    .isInt({ min: 1 }).withMessage('ID de ítem inválido'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
];

const currencyValidators = [
  body('pc').optional().isInt({ min: 0 }).withMessage('PC debe ser mayor o igual a 0'),
  body('pp').optional().isInt({ min: 0 }).withMessage('PP debe ser mayor o igual a 0'),
  body('pe').optional().isInt({ min: 0 }).withMessage('PE debe ser mayor o igual a 0'),
  body('po').optional().isInt({ min: 0 }).withMessage('PO debe ser mayor o igual a 0'),
  body('ppt').optional().isInt({ min: 0 }).withMessage('PPT debe ser mayor o igual a 0'),
];

module.exports = { characterValidators, addItemValidators, currencyValidators };
