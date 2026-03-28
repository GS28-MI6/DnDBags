const { validationResult } = require('express-validator');
const pool = require('../config/db');

const isMember = async (campaignId, userId) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM campaign_users WHERE campaign_id = ? AND user_id = ?',
    [campaignId, userId]
  );
  return rows.length > 0;
};

const createCharacter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id } = req.params;
  const userId = req.userId;
  const { name } = req.body;

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [result] = await pool.query(
      'INSERT INTO characters (campaign_id, user_id, name) VALUES (?, ?, ?)',
      [id, userId, name]
    );

    await pool.query(
      'INSERT INTO character_currency (character_id) VALUES (?)',
      [result.insertId]
    );

    const [chars] = await pool.query('SELECT * FROM characters WHERE id = ?', [result.insertId]);
    return res.status(201).json({ character: chars[0] });
  } catch (err) {
    console.error('Error creando personaje:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCharacters = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    if (!(await isMember(id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [chars] = await pool.query(
      `SELECT ch.*, u.email as user_email FROM characters ch
       JOIN users u ON ch.user_id = u.id
       WHERE ch.campaign_id = ?
       ORDER BY ch.created_at ASC`,
      [id]
    );
    return res.json({ characters: chars });
  } catch (err) {
    console.error('Error listando personajes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const addItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { charId } = req.params;
  const userId = req.userId;
  const { itemSource, itemId, quantity } = req.body;

  try {
    const [chars] = await pool.query(
      'SELECT * FROM characters WHERE id = ?',
      [charId]
    );
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    const char = chars[0];
    if (!(await isMember(char.campaign_id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM character_items WHERE character_id = ? AND item_source = ? AND item_id = ?',
      [charId, itemSource, itemId]
    );

    let itemRowId;
    if (existing.length > 0) {
      itemRowId = existing[0].id;
      await pool.query(
        'UPDATE character_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, itemRowId]
      );
    } else {
      const [result] = await pool.query(
        'INSERT INTO character_items (character_id, item_source, item_id, quantity) VALUES (?, ?, ?, ?)',
        [charId, itemSource, itemId, quantity]
      );
      itemRowId = result.insertId;
    }

    const [items] = await pool.query('SELECT * FROM character_items WHERE id = ?', [itemRowId]);
    return res.status(201).json({ item: items[0] });
  } catch (err) {
    console.error('Error añadiendo ítem:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateItem = async (req, res) => {
  const { charId, id } = req.params;
  const userId = req.userId;
  const { quantity } = req.body;

  if (!quantity || parseInt(quantity) < 1) {
    return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
  }

  try {
    const [chars] = await pool.query('SELECT * FROM characters WHERE id = ?', [charId]);
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    if (!(await isMember(chars[0].campaign_id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM character_items WHERE id = ? AND character_id = ?',
      [id, charId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ítem no encontrado en inventario' });
    }

    await pool.query('UPDATE character_items SET quantity = ? WHERE id = ?', [quantity, id]);

    const [items] = await pool.query('SELECT * FROM character_items WHERE id = ?', [id]);
    return res.json({ item: items[0] });
  } catch (err) {
    console.error('Error actualizando ítem:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteItem = async (req, res) => {
  const { charId, id } = req.params;
  const userId = req.userId;

  try {
    const [chars] = await pool.query('SELECT * FROM characters WHERE id = ?', [charId]);
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    if (!(await isMember(chars[0].campaign_id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM character_items WHERE id = ? AND character_id = ?',
      [id, charId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ítem no encontrado en inventario' });
    }

    await pool.query('DELETE FROM character_items WHERE id = ?', [id]);
    return res.json({ message: 'Ítem eliminado del inventario' });
  } catch (err) {
    console.error('Error eliminando ítem:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getItems = async (req, res) => {
  const { charId } = req.params;
  const userId = req.userId;

  try {
    const [chars] = await pool.query('SELECT * FROM characters WHERE id = ?', [charId]);
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    if (!(await isMember(chars[0].campaign_id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [items] = await pool.query(
      'SELECT * FROM character_items WHERE character_id = ?',
      [charId]
    );

    // Collect IDs per source to fetch all details in three batch queries
    const baseIds = items.filter(i => i.item_source === 'base').map(i => i.item_id);
    const customIds = items.filter(i => i.item_source === 'custom').map(i => i.item_id);
    const overrideIds = items.filter(i => i.item_source === 'override').map(i => i.item_id);

    const detailMap = new Map();

    if (baseIds.length > 0) {
      const [rows] = await pool.query(
        `SELECT bi.*, it.name as item_type_name FROM base_items bi
         JOIN item_types it ON bi.item_type_id = it.id
         WHERE bi.id IN (?)`,
        [baseIds]
      );
      for (const r of rows) detailMap.set(`base:${r.id}`, r);
    }

    if (customIds.length > 0) {
      const [rows] = await pool.query(
        `SELECT cci.*, it.name as item_type_name FROM campaign_custom_items cci
         JOIN item_types it ON cci.item_type_id = it.id
         WHERE cci.id IN (?)`,
        [customIds]
      );
      for (const r of rows) detailMap.set(`custom:${r.id}`, r);
    }

    if (overrideIds.length > 0) {
      const [rows] = await pool.query(
        `SELECT cio.*, it.name as item_type_name FROM campaign_item_overrides cio
         JOIN item_types it ON cio.item_type_id = it.id
         WHERE cio.id IN (?)`,
        [overrideIds]
      );
      for (const r of rows) detailMap.set(`override:${r.id}`, r);
    }

    const enriched = items.map(item => {
      const detail = detailMap.get(`${item.item_source}:${item.item_id}`) || null;
      return {
        id: item.id,
        characterId: item.character_id,
        itemSource: item.item_source,
        itemId: item.item_id,
        quantity: item.quantity,
        name: detail ? detail.name : 'Ítem desconocido',
        weight: detail ? parseFloat(detail.weight) : 0,
        description: detail ? detail.description : '',
        itemType: detail ? detail.item_type_name : '',
      };
    });

    return res.json({ items: enriched });
  } catch (err) {
    console.error('Error obteniendo ítems del personaje:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCurrency = async (req, res) => {
  const { charId } = req.params;
  const userId = req.userId;

  try {
    const [chars] = await pool.query('SELECT * FROM characters WHERE id = ?', [charId]);
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    if (!(await isMember(chars[0].campaign_id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    const [currency] = await pool.query(
      'SELECT * FROM character_currency WHERE character_id = ?',
      [charId]
    );

    if (currency.length === 0) {
      return res.json({ currency: { character_id: parseInt(charId), pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 } });
    }

    return res.json({ currency: currency[0] });
  } catch (err) {
    console.error('Error obteniendo moneda:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCurrency = async (req, res) => {
  const { charId } = req.params;
  const userId = req.userId;
  const { pc = 0, pp = 0, pe = 0, po = 0, ppt = 0 } = req.body;

  try {
    const [chars] = await pool.query('SELECT * FROM characters WHERE id = ?', [charId]);
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    if (!(await isMember(chars[0].campaign_id, userId))) {
      return res.status(403).json({ error: 'No tienes acceso a esta campaña' });
    }

    await pool.query(
      `INSERT INTO character_currency (character_id, pc, pp, pe, po, ppt)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE pc = ?, pp = ?, pe = ?, po = ?, ppt = ?`,
      [charId, pc, pp, pe, po, ppt, pc, pp, pe, po, ppt]
    );

    const [currency] = await pool.query(
      'SELECT * FROM character_currency WHERE character_id = ?',
      [charId]
    );

    return res.json({ currency: currency[0] });
  } catch (err) {
    console.error('Error actualizando moneda:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createCharacter,
  getCharacters,
  addItem,
  updateItem,
  deleteItem,
  getItems,
  getCurrency,
  updateCurrency,
};
