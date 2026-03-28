import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';

export default function ItemEditModal({ campaignId, item, itemTypes, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item.name,
    weight: item.weight,
    description: item.description || '',
    itemTypeId: item.itemTypeId,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.itemTypeId) {
      toast.error('Nombre y tipo son requeridos');
      return;
    }
    if (parseFloat(form.weight) < 0) {
      toast.error('El peso no puede ser negativo');
      return;
    }
    setSubmitting(true);
    try {
      let data;
      if (item.source === 'custom') {
        const res = await api.put(`/campaigns/${campaignId}/custom-items/${item.id}`, {
          name: form.name.trim(),
          weight: parseFloat(form.weight),
          description: form.description.trim() || null,
          itemTypeId: parseInt(form.itemTypeId),
        });
        data = res.data.item;
        onSaved({ ...data, base_item_id: null });
      } else if (item.source === 'base') {
        const res = await api.post(`/campaigns/${campaignId}/overrides`, {
          baseItemId: item.id,
          name: form.name.trim(),
          weight: parseFloat(form.weight),
          description: form.description.trim() || null,
          itemTypeId: parseInt(form.itemTypeId),
        });
        onSaved(res.data.override);
      } else if (item.source === 'override') {
        const res = await api.put(`/campaigns/${campaignId}/overrides/${item.id}`, {
          name: form.name.trim(),
          weight: parseFloat(form.weight),
          description: form.description.trim() || null,
          itemTypeId: parseInt(form.itemTypeId),
        });
        onSaved(res.data.override);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar cambios');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Ítem</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {item.source === 'base' && (
          <p className="override-note">
            ⚠️ Editar un ítem base crea una modificación local para esta campaña.
          </p>
        )}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Peso (lb)</label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={form.itemTypeId}
                onChange={(e) => setForm({ ...form, itemTypeId: e.target.value })}
                required
              >
                <option value="">-- Tipo --</option>
                {itemTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
