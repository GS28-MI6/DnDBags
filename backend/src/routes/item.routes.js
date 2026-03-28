const express = require('express');
const router = express.Router();
const {
  getCampaignItems,
  createCustomItem,
  updateCustomItem,
  getCustomItems,
  createOverride,
  updateOverride,
  getItemTypes,
} = require('../controllers/item.controller');
const { itemValidators } = require('../validators/item.validators');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/item-types', getItemTypes);
router.get('/:id/items', getCampaignItems);
router.post('/:id/custom-items', itemValidators, createCustomItem);
router.put('/:id/custom-items/:itemId', itemValidators, updateCustomItem);
router.get('/:id/custom-items', getCustomItems);
router.post('/:id/overrides', createOverride);
router.put('/:id/overrides/:overrideId', updateOverride);

module.exports = router;
