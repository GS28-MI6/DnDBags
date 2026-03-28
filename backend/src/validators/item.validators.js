const { body } = require('express-validator');

const itemValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del ítem es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('weight')
    .isFloat({ min: 0 }).withMessage('El peso debe ser mayor o igual a 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar 500 caracteres'),
  body('itemTypeId')
    .isInt({ min: 1 }).withMessage('El tipo de ítem no es válido'),
];

module.exports = { itemValidators };
