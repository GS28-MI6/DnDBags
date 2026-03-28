const { validationResult } = require('express-validator');
const pool = require('../config/db');

const isMember = async (campaignId, userId) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM campaign_users WHERE campaign_id = ? AND user_id = ?',
    [campaignId, userId]
  );
  return rows.length > 0;
};

const getCampaignItems = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [campaign] = await pool.query('SELECT ruleset_id FROM campaigns WHERE id = ?', [id]);
    if (campaign.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    const rulesetId = campaign[0].ruleset_id;

    // Base items
    const [baseItems] = await pool.query(
      `SELECT bi.id, bi.name, bi.weight, bi.description, bi.item_type_id,
              it.name as item_type_name
       FROM base_items bi
       JOIN item_types it ON bi.item_type_id = it.id
       WHERE bi.ruleset_id = ?`,
      [rulesetId]
    );

    // Overrides
    const [overrides] = await pool.query(
      `SELECT cio.id, cio.base_item_id, cio.name, cio.weight, cio.description, cio.item_type_id,
              it.name as item_type_name
       FROM campaign_item_overrides cio
       JOIN item_types it ON cio.item_type_id = it.id
       WHERE cio.campaign_id = ?`,
      [id]
    );

    // Custom items
    const [customItems] = await pool.query(
      `SELECT cci.id, cci.name, cci.weight, cci.description, cci.item_type_id,
              it.name as item_type_name
       FROM campaign_custom_items cci
       JOIN item_types it ON cci.item_type_id = it.id
       WHERE cci.campaign_id = ?`,
      [id]
    );

    const overrideMap = new Map();
    for (const ov of overrides) {
      overrideMap.set(ov.base_item_id, ov);
    }

    const mergedItems = [];

    for (const base of baseItems) {
      if (overrideMap.has(base.id)) {
        const ov = overrideMap.get(base.id);
        mergedItems.push({
          id: ov.id,
          source: 'override',
          originalBaseItemId: base.id,
          name: ov.name,
          weight: parseFloat(ov.weight),
          description: ov.description,
          itemTypeId: ov.item_type_id,
          itemType: ov.item_type_name,
        });
      } else {
        mergedItems.push({
          id: base.id,
          source: 'base',
          originalBaseItemId: null,
          name: base.name,
          weight: parseFloat(base.weight),
          description: base.description,
          itemTypeId: base.item_type_id,
          itemType: base.item_type_name,
        });
      }
    }

    for (const custom of customItems) {
      mergedItems.push({
        id: custom.id,
        source: 'custom',
        originalBaseItemId: null,
        name: custom.name,
        weight: parseFloat(custom.weight),
        description: custom.description,
        itemTypeId: custom.item_type_id,
        itemType: custom.item_type_name,
      });
    }

    return res.json({ items: mergedItems });
  } catch (err) {
    console.error('Error obteniendo ítems:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCustomItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id } = req.params;
  const userId = req.userId;
  const { name, weight, description, itemTypeId } = req.body;

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [result] = await pool.query(
      'INSERT INTO campaign_custom_items (campaign_id, name, weight, description, item_type_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, weight, description || null, itemTypeId, userId]
    );

    const [items] = await pool.query(
      `SELECT cci.*, it.name as item_type_name FROM campaign_custom_items cci
       JOIN item_types it ON cci.item_type_id = it.id
       WHERE cci.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ item: items[0] });
  } catch (err) {
    console.error('Error creando ítem personalizado:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCustomItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id, itemId } = req.params;
  const userId = req.userId;
  const { name, weight, description, itemTypeId } = req.body;

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM campaign_custom_items WHERE id = ? AND campaign_id = ?',
      [itemId, id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ítem personalizado no encontrado' });
    }

    await pool.query(
      'UPDATE campaign_custom_items SET name = ?, weight = ?, description = ?, item_type_id = ? WHERE id = ?',
      [name, weight, description || null, itemTypeId, itemId]
    );

    const [items] = await pool.query(
      `SELECT cci.*, it.name as item_type_name FROM campaign_custom_items cci
       JOIN item_types it ON cci.item_type_id = it.id
       WHERE cci.id = ?`,
      [itemId]
    );

    return res.json({ item: items[0] });
  } catch (err) {
    console.error('Error actualizando ítem:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCustomItems = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [items] = await pool.query(
      `SELECT cci.*, it.name as item_type_name FROM campaign_custom_items cci
       JOIN item_types it ON cci.item_type_id = it.id
       WHERE cci.campaign_id = ?`,
      [id]
    );

    return res.json({ items });
  } catch (err) {
    console.error('Error listando ítems personalizados:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createOverride = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { baseItemId, name, weight, description, itemTypeId } = req.body;

  if (!baseItemId || name === undefined || weight === undefined || !itemTypeId) {
    return res.status(400).json({ error: 'Datos incompletos para el override' });
  }
  if (parseFloat(weight) < 0) {
    return res.status(400).json({ error: 'El peso debe ser mayor o igual a 0' });
  }

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM campaign_item_overrides WHERE campaign_id = ? AND base_item_id = ?',
      [id, baseItemId]
    );

    let overrideId;
    if (existing.length > 0) {
      overrideId = existing[0].id;
      await pool.query(
        'UPDATE campaign_item_overrides SET name = ?, weight = ?, description = ?, item_type_id = ? WHERE id = ?',
        [name, weight, description || null, itemTypeId, overrideId]
      );
    } else {
      const [result] = await pool.query(
        'INSERT INTO campaign_item_overrides (campaign_id, base_item_id, name, weight, description, item_type_id) VALUES (?, ?, ?, ?, ?, ?)',
        [id, baseItemId, name, weight, description || null, itemTypeId]
      );
      overrideId = result.insertId;
    }

    const [overrides] = await pool.query(
      `SELECT cio.*, it.name as item_type_name FROM campaign_item_overrides cio
       JOIN item_types it ON cio.item_type_id = it.id
       WHERE cio.id = ?`,
      [overrideId]
    );

    return res.status(201).json({ override: overrides[0] });
  } catch (err) {
    console.error('Error creando override:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateOverride = async (req, res) => {
  const { id, overrideId } = req.params;
  const userId = req.userId;
  const { name, weight, description, itemTypeId } = req.body;

  if (name === undefined || weight === undefined || !itemTypeId) {
    return res.status(400).json({ error: 'Datos incompletos para el override' });
  }
  if (parseFloat(weight) < 0) {
    return res.status(400).json({ error: 'El peso debe ser mayor o igual a 0' });
  }

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM campaign_item_overrides WHERE id = ? AND campaign_id = ?',
      [overrideId, id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Override no encontrado' });
    }

    await pool.query(
      'UPDATE campaign_item_overrides SET name = ?, weight = ?, description = ?, item_type_id = ? WHERE id = ?',
      [name, weight, description || null, itemTypeId, overrideId]
    );

    const [overrides] = await pool.query(
      `SELECT cio.*, it.name as item_type_name FROM campaign_item_overrides cio
       JOIN item_types it ON cio.item_type_id = it.id
       WHERE cio.id = ?`,
      [overrideId]
    );

    return res.json({ override: overrides[0] });
  } catch (err) {
    console.error('Error actualizando override:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getItemTypes = async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM item_types ORDER BY id');
    return res.json({ itemTypes: types });
  } catch (err) {
    console.error('Error listando tipos de ítem:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getCampaignItems,
  createCustomItem,
  updateCustomItem,
  getCustomItems,
  createOverride,
  updateOverride,
  getItemTypes,
};
