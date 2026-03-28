import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';

export default function AddItemForm({ campaignId, characters, items, onItemAdded }) {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedChar, setSelectedChar] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    return items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10);
  }, [search, items]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearch(item.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !selectedChar || quantity < 1) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/characters/${selectedChar}/items`, {
        itemSource: selectedItem.source,
        itemId: selectedItem.id,
        quantity,
      });
      toast.success(`${selectedItem.name} añadido al inventario`);
      setSearch('');
      setSelectedItem(null);
      setQuantity(1);
      onItemAdded && onItemAdded();
      // Notify CharacterAccordion to refresh its data
      window.dispatchEvent(new CustomEvent('item-added', { detail: { charId: selectedChar } }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al añadir ítem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-item-form">
      <h3>Añadir Ítem a Personaje</h3>
      <form onSubmit={handleSubmit} className="add-item-row">
        <div className="form-group typeahead-wrapper">
          <label>Buscar ítem</label>
          <input
            type="text"
            placeholder="Escribe para buscar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedItem(null); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="typeahead-dropdown">
              {filtered.map((item) => (
                <li key={`${item.source}-${item.id}`} onMouseDown={() => handleSelectItem(item)}>
                  <span className="item-name">{item.name}</span>
                  <span className={`source-badge source-${item.source}`}>
                    {item.source === 'base' ? 'Base' : item.source === 'custom' ? 'Personalizado' : 'Modificado'}
                  </span>
                  <span className="item-weight">{item.weight} lb</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <label>Personaje</label>
          <select value={selectedChar} onChange={(e) => setSelectedChar(e.target.value)} required>
            <option value="">-- Personaje --</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group form-group-sm">
          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting || !selectedItem}>
          {submitting ? 'Añadiendo...' : '+ Añadir'}
        </button>
      </form>
    </div>
  );
}
