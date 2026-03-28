const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getMyCampaigns,
  joinCampaign,
  getCampaign,
  getRulesets,
} = require('../controllers/campaign.controller');
const { createCampaignValidators, joinCampaignValidators } = require('../validators/campaign.validators');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/rulesets', getRulesets);
router.post('/', createCampaignValidators, createCampaign);
router.get('/', getMyCampaigns);
router.post('/join', joinCampaignValidators, joinCampaign);
router.get('/:id', getCampaign);

module.exports = router;
