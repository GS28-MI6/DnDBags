const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const pool = require('../config/db');

const createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, rulesetId } = req.body;
  const userId = req.userId;
  const campaignId = uuidv4();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'INSERT INTO campaigns (id, name, ruleset_id, created_by) VALUES (?, ?, ?, ?)',
      [campaignId, name, rulesetId, userId]
    );

    await conn.query(
      'INSERT INTO campaign_users (campaign_id, user_id) VALUES (?, ?)',
      [campaignId, userId]
    );

    await conn.commit();

    const [campaigns] = await conn.query(
      `SELECT c.*, r.name as ruleset_name FROM campaigns c
       JOIN rulesets r ON c.ruleset_id = r.id
       WHERE c.id = ?`,
      [campaignId]
    );

    return res.status(201).json({ campaign: campaigns[0] });
  } catch (err) {
    await conn.rollback();
    console.error('Error creando campaña:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

const getMyCampaigns = async (req, res) => {
  try {
    const [campaigns] = await pool.query(
      `SELECT c.*, r.name as ruleset_name,
       (SELECT COUNT(*) FROM campaign_users cu WHERE cu.campaign_id = c.id) as member_count
       FROM campaigns c
       JOIN rulesets r ON c.ruleset_id = r.id
       JOIN campaign_users cu ON cu.campaign_id = c.id
       WHERE cu.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.userId]
    );
    return res.json({ campaigns });
  } catch (err) {
    console.error('Error listando campañas:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const joinCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { campaignId } = req.body;
  const userId = req.userId;

  try {
    const [campaigns] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM campaign_users WHERE campaign_id = ? AND user_id = ?',
      [campaignId, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya eres miembro de esta campaña' });
    }

    await pool.query(
      'INSERT INTO campaign_users (campaign_id, user_id) VALUES (?, ?)',
      [campaignId, userId]
    );

    return res.json({ message: 'Te has unido a la campaña exitosamente', campaign: campaigns[0] });
  } catch (err) {
    console.error('Error uniéndose a campaña:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCampaign = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const [member] = await pool.query(
      'SELECT * FROM campaign_users WHERE campaign_id = ? AND user_id = ?',
      [id, userId]
    );
    if (member.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [campaigns] = await pool.query(
      `SELECT c.*, r.name as ruleset_name, r.description as ruleset_description
       FROM campaigns c
       JOIN rulesets r ON c.ruleset_id = r.id
       WHERE c.id = ?`,
      [id]
    );
    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    return res.json({ campaign: campaigns[0] });
  } catch (err) {
    console.error('Error obteniendo campaña:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getRulesets = async (req, res) => {
  try {
    const [rulesets] = await pool.query('SELECT * FROM rulesets ORDER BY id');
    return res.json({ rulesets });
  } catch (err) {
    console.error('Error listando rulesets:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { createCampaign, getMyCampaigns, joinCampaign, getCampaign, getRulesets };
