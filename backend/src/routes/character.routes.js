const express = require('express');
const router = express.Router();
const {
  createCharacter,
  getCharacters,
  addItem,
  updateItem,
  deleteItem,
  getItems,
  getCurrency,
  updateCurrency,
} = require('../controllers/character.controller');
const { characterValidators, addItemValidators, currencyValidators } = require('../validators/character.validators');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Campaign characters
router.post('/campaigns/:id/characters', characterValidators, createCharacter);
router.get('/campaigns/:id/characters', getCharacters);

// Character items
router.post('/characters/:charId/items', addItemValidators, addItem);
router.put('/characters/:charId/items/:id', updateItem);
router.delete('/characters/:charId/items/:id', deleteItem);
router.get('/characters/:charId/items', getItems);

// Currency
router.get('/characters/:charId/currency', getCurrency);
router.put('/characters/:charId/currency', currencyValidators, updateCurrency);

module.exports = router;
