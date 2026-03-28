import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [rulesets, setRulesets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', rulesetId: '' });
  const [joinId, setJoinId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campaignsRes, rulesetsRes] = await Promise.all([
        api.get('/campaigns'),
        api.get('/campaigns/rulesets'),
      ]);
      setCampaigns(campaignsRes.data.campaigns);
      setRulesets(rulesetsRes.data.rulesets);
    } catch (err) {
      toast.error('Error al cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.rulesetId) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/campaigns', {
        name: createForm.name.trim(),
        rulesetId: parseInt(createForm.rulesetId),
      });
      setCampaigns((prev) => [data.campaign, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ name: '', rulesetId: '' });
      toast.success('¡Campaña creada exitosamente!');
      navigate(`/campania/${data.campaign.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear la campaña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) {
      toast.error('Por favor ingresa el ID de campaña');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/campaigns/join', { campaignId: joinId.trim() });
      toast.success('¡Te has unido a la campaña!');
      setShowJoinModal(false);
      setJoinId('');
      navigate(`/campania/${data.campaign.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al unirse a la campaña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mis Campañas</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Crear Campaña
          </button>
          <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
            Unirse a Campaña
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando campañas...</div>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <p>🗺️ No tienes campañas todavía.</p>
          <p>¡Crea una nueva o únete a una existente!</p>
        </div>
      ) : (
        <div className="campaign-grid">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="campaign-card"
              onClick={() => navigate(`/campania/${c.id}`)}
            >
              <h3>{c.name}</h3>
              <p className="ruleset-badge">{c.ruleset_name}</p>
              <p className="member-count">👥 {c.member_count} miembro(s)</p>
              <p className="campaign-date">
                Creada: {new Date(c.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Campaña */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Campaña</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Nombre de la campaña</label>
                <input
                  type="text"
                  placeholder="Ej: La Mina Perdida de Phandelver"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sistema de juego (Ruleset)</label>
                <select
                  value={createForm.rulesetId}
                  onChange={(e) => setCreateForm({ ...createForm, rulesetId: e.target.value })}
                  required
                >
                  <option value="">-- Selecciona un ruleset --</option>
                  {rulesets.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Campaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Unirse */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Unirse a Campaña</h2>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>✕</button>
            </div>
            <form onSubmit={handleJoin} className="modal-form">
              <div className="form-group">
                <label>ID de la campaña</label>
                <input
                  type="text"
                  placeholder="Pega aquí el ID de campaña"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Uniéndose...' : 'Unirse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
