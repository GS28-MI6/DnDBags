import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';

const COIN_WEIGHT = 0.02;

export default function CharacterAccordion({ character, campaignId, onEditItem }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('items');
  const [items, setItems] = useState([]);
  const [currency, setCurrency] = useState({ pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 });
  const [editingCurrency, setEditingCurrency] = useState(false);
  const [currencyForm, setCurrencyForm] = useState({ pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 });
  const [loadedData, setLoadedData] = useState(false);

  const loadCharacterData = useCallback(async () => {
    try {
      const [itemsRes, currencyRes] = await Promise.all([
        api.get(`/characters/${character.id}/items`),
        api.get(`/characters/${character.id}/currency`),
      ]);
      setItems(itemsRes.data.items);
      setCurrency(currencyRes.data.currency);
      setCurrencyForm(currencyRes.data.currency);
      setLoadedData(true);
    } catch {
      toast.error('Error al cargar datos del personaje');
    }
  }, [character.id]);

  useEffect(() => {
    if (open && !loadedData) {
      loadCharacterData();
    }
  }, [open, loadedData, loadCharacterData]);

  // Listen for item-added events to refresh this character's data
  useEffect(() => {
    const handleItemAdded = (e) => {
      if (String(e.detail?.charId) === String(character.id)) {
        setLoadedData(false);
      }
    };
    window.addEventListener('item-added', handleItemAdded);
    return () => window.removeEventListener('item-added', handleItemAdded);
  }, [character.id]);

  // Re-fetch when loadedData is reset while accordion is open
  useEffect(() => {
    if (open && !loadedData) {
      loadCharacterData();
    }
  }, [loadedData, open, loadCharacterData]);

  const itemsWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const coinsTotal = (currency.pc || 0) + (currency.pp || 0) + (currency.pe || 0) + (currency.po || 0) + (currency.ppt || 0);
  const currencyWeight = coinsTotal * COIN_WEIGHT;
  const totalWeight = itemsWeight + currencyWeight;

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/characters/${character.id}/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success('Ítem eliminado del inventario');
    } catch {
      toast.error('Error al eliminar ítem');
    }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/characters/${character.id}/items/${itemId}`, { quantity: newQty });
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity: newQty } : i));
    } catch {
      toast.error('Error al actualizar cantidad');
    }
  };

  const handleSaveCurrency = async () => {
    try {
      const { data } = await api.put(`/characters/${character.id}/currency`, currencyForm);
      setCurrency(data.currency);
      setCurrencyForm(data.currency);
      setEditingCurrency(false);
      toast.success('Moneda actualizada');
    } catch {
      toast.error('Error al actualizar moneda');
    }
  };

  const formatCurrency = (c) => {
    const parts = [];
    if (c.pc > 0) parts.push(`${c.pc} PC`);
    if (c.pp > 0) parts.push(`${c.pp} PP`);
    if (c.pe > 0) parts.push(`${c.pe} PE`);
    if (c.po > 0) parts.push(`${c.po} PO`);
    if (c.ppt > 0) parts.push(`${c.ppt} PPT`);
    return parts.length > 0 ? parts.join(', ') : 'Sin moneda';
  };

  return (
    <div className="accordion">
      <button className="accordion-header" onClick={() => setOpen(!open)}>
        <span className="accordion-icon">{open ? '▼' : '▶'}</span>
        <span className="accordion-name">🧙 {character.name}</span>
        <span className="accordion-meta">
          ⚖️ {totalWeight.toFixed(2)} lb
          {items.length > 0 && ` · ${items.length} ítem(s)`}
        </span>
      </button>
      {open && (
        <div className="accordion-body">
          <div className="char-tabs">
            <button
              className={`char-tab ${activeSection === 'items' ? 'active' : ''}`}
              onClick={() => setActiveSection('items')}
            >
              🎒 Inventario
            </button>
            <button
              className={`char-tab ${activeSection === 'currency' ? 'active' : ''}`}
              onClick={() => setActiveSection('currency')}
            >
              💰 Moneda
            </button>
          </div>

          {activeSection === 'items' && (
            <div className="char-items">
              {items.length === 0 ? (
                <p className="empty-small">Este personaje no tiene ítems.</p>
              ) : (
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Ítem</th>
                      <th>Tipo</th>
                      <th>Peso/u</th>
                      <th>Cant.</th>
                      <th>Peso total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.itemType}</td>
                        <td>{item.weight} lb</td>
                        <td>
                          <div className="qty-control">
                            <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                          </div>
                        </td>
                        <td>{(item.weight * item.quantity).toFixed(2)} lb</td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteItem(item.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4}><strong>Peso de ítems:</strong></td>
                      <td colSpan={2}><strong>{itemsWeight.toFixed(2)} lb</strong></td>
                    </tr>
                    <tr>
                      <td colSpan={4}><strong>Peso de monedas:</strong></td>
                      <td colSpan={2}><strong>{currencyWeight.toFixed(2)} lb</strong></td>
                    </tr>
                    <tr className="total-row">
                      <td colSpan={4}><strong>Peso total:</strong></td>
                      <td colSpan={2}><strong>{totalWeight.toFixed(2)} lb</strong></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {activeSection === 'currency' && (
            <div className="currency-section">
              {editingCurrency ? (
                <div className="currency-edit">
                  <div className="currency-inputs">
                    {['pc', 'pp', 'pe', 'po', 'ppt'].map((coin) => (
                      <div key={coin} className="currency-input-group">
                        <label>{coin.toUpperCase()}</label>
                        <input
                          type="number"
                          min="0"
                          value={currencyForm[coin]}
                          onChange={(e) => setCurrencyForm({ ...currencyForm, [coin]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="currency-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCurrency(false); setCurrencyForm(currency); }}>
                      Cancelar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveCurrency}>
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="currency-display">
                  <p className="currency-text">{formatCurrency(currency)}</p>
                  <p className="currency-weight">Peso de monedas: {currencyWeight.toFixed(2)} lb ({coinsTotal} monedas × 0.02 lb)</p>
                  <button className="btn btn-sm btn-outline" onClick={() => setEditingCurrency(true)}>
                    ✏️ Editar moneda
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
