const { body } = require('express-validator');

const registerValidators = [
  body('email')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const loginValidators = [
  body('email')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
];

module.exports = { registerValidators, loginValidators };
