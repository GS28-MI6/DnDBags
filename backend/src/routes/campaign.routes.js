const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getMyCampaigns,
  joinCampaign,
  getCampaign,
  getRulesets,
} = require('../controllers/campaign.controller');
const { getItemTypes } = require('../controllers/item.controller');
const { createCampaignValidators, joinCampaignValidators } = require('../validators/campaign.validators');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Static routes must come before /:id to avoid being shadowed
router.get('/rulesets', getRulesets);
router.get('/item-types', getItemTypes);
router.post('/', createCampaignValidators, createCampaign);
router.get('/', getMyCampaigns);
router.post('/join', joinCampaignValidators, joinCampaign);
router.get('/:id', getCampaign);

module.exports = router;
