import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import CharacterAccordion from '../components/CharacterAccordion.jsx';
import AddItemForm from '../components/AddItemForm.jsx';
import CustomItemModal from '../components/CustomItemModal.jsx';
import ItemEditModal from '../components/ItemEditModal.jsx';

export default function CampaignPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventario');

  const [showCreateCharModal, setShowCreateCharModal] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [campRes, charsRes, itemsRes, typesRes] = await Promise.all([
        api.get(`/campaigns/${campaignId}`),
        api.get(`/campaigns/${campaignId}/characters`),
        api.get(`/campaigns/${campaignId}/items`),
        api.get('/campaigns/item-types'),
      ]);
      setCampaign(campRes.data.campaign);
      setCharacters(charsRes.data.characters);
      setItems(itemsRes.data.items);
      setItemTypes(typesRes.data.itemTypes);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('No tienes acceso a esta campaña');
        navigate('/');
      } else {
        toast.error('Error al cargar la campaña');
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(campaignId);
      toast.success('ID de campaña copiado al portapapeles');
    } catch {
      toast.info(`ID: ${campaignId}`);
    }
  };

  const handleCreateChar = async (e) => {
    e.preventDefault();
    if (!newCharName.trim()) {
      toast.error('El nombre del personaje es requerido');
      return;
    }
    try {
      const { data } = await api.post(`/campaigns/${campaignId}/characters`, {
        name: newCharName.trim(),
      });
      setCharacters((prev) => [...prev, data.character]);
      setShowCreateCharModal(false);
      setNewCharName('');
      toast.success('¡Personaje creado!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear personaje');
    }
  };

  const handleItemAdded = useCallback(() => {
    // Refresh is handled via the 'item-added' custom event in CharacterAccordion
  }, []);

  const handleCustomItemCreated = (newItem) => {
    setItems((prev) => [...prev, {
      id: newItem.id,
      source: 'custom',
      name: newItem.name,
      weight: parseFloat(newItem.weight),
      description: newItem.description,
      itemTypeId: newItem.item_type_id,
      itemType: newItem.item_type_name,
    }]);
    setShowCustomItemModal(false);
    toast.success('Ítem personalizado creado');
  };

  const handleOverrideSaved = (override) => {
    setItems((prev) => prev.map((item) => {
      if (item.source === 'base' && item.id === override.base_item_id) {
        return {
          id: override.id,
          source: 'override',
          originalBaseItemId: override.base_item_id,
          name: override.name,
          weight: parseFloat(override.weight),
          description: override.description,
          itemTypeId: override.item_type_id,
          itemType: override.item_type_name,
        };
      }
      if (item.source === 'override' && item.id === override.id) {
        return {
          ...item,
          name: override.name,
          weight: parseFloat(override.weight),
          description: override.description,
          itemTypeId: override.item_type_id,
          itemType: override.item_type_name,
        };
      }
      return item;
    }));
    setEditingItem(null);
    toast.success('Ítem actualizado');
  };

  if (loading) return <div className="loading">Cargando campaña...</div>;
  if (!campaign) return <div className="loading">Campaña no encontrada</div>;

  return (
    <div className="page">
      <div className="campaign-header">
        <div>
          <h1>{campaign.name}</h1>
          <span className="ruleset-badge">{campaign.ruleset_name}</span>
        </div>
        <div className="campaign-header-actions">
          <button className="btn btn-secondary" onClick={handleShare}>
            📋 Compartir ID
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >
          📦 Inventario
        </button>
        <button
          className={`tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          ⚔️ Ítems
        </button>
        <button
          className={`tab ${activeTab === 'personajes' ? 'active' : ''}`}
          onClick={() => setActiveTab('personajes')}
        >
          👤 Personajes
        </button>
      </div>

      {/* INVENTARIO TAB */}
      {activeTab === 'inventario' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Inventario de la Campaña</h2>
          </div>
          {characters.length === 0 ? (
            <div className="empty-state">
              <p>No hay personajes en esta campaña. ¡Crea uno en la pestaña Personajes!</p>
            </div>
          ) : (
            <>
              <AddItemForm
                campaignId={campaignId}
                characters={characters}
                items={items}
                onItemAdded={handleItemAdded}
              />
              <div className="characters-list">
                {characters.map((char) => (
                  <CharacterAccordion
                    key={char.id}
                    character={char}
                    campaignId={campaignId}
                    onEditItem={(item) => setEditingItem(item)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ITEMS TAB */}
      {activeTab === 'items' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Pool de Ítems</h2>
            <button className="btn btn-primary" onClick={() => setShowCustomItemModal(true)}>
              + Ítem Personalizado
            </button>
          </div>
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Peso (lb)</th>
                  <th>Fuente</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.source}-${item.id}`}>
                    <td>{item.name}</td>
                    <td>{item.itemType}</td>
                    <td>{item.weight}</td>
                    <td>
                      <span className={`source-badge source-${item.source}`}>
                        {item.source === 'base' ? 'Base' : item.source === 'custom' ? 'Personalizado' : 'Modificado'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditingItem(item)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERSONAJES TAB */}
      {activeTab === 'personajes' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Personajes</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateCharModal(true)}>
              + Crear Personaje
            </button>
          </div>
          {characters.length === 0 ? (
            <div className="empty-state">
              <p>No hay personajes en esta campaña todavía.</p>
            </div>
          ) : (
            <div className="characters-simple-list">
              {characters.map((char) => (
                <div key={char.id} className="character-card-simple">
                  <span className="char-icon">🧙</span>
                  <div>
                    <strong>{char.name}</strong>
                    <p className="char-owner">Jugador: {char.user_email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Crear Personaje */}
      {showCreateCharModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCharModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Personaje</h2>
              <button className="modal-close" onClick={() => setShowCreateCharModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateChar} className="modal-form">
              <div className="form-group">
                <label>Nombre del personaje</label>
                <input
                  type="text"
                  placeholder="Ej: Thorin Escudo de Roble"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateCharModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Personaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ítem Personalizado */}
      {showCustomItemModal && (
        <CustomItemModal
          campaignId={campaignId}
          itemTypes={itemTypes}
          onClose={() => setShowCustomItemModal(false)}
          onCreated={handleCustomItemCreated}
        />
      )}

      {/* Modal Editar Ítem */}
      {editingItem && (
        <ItemEditModal
          campaignId={campaignId}
          item={editingItem}
          itemTypes={itemTypes}
          onClose={() => setEditingItem(null)}
          onSaved={handleOverrideSaved}
        />
      )}
    </div>
  );
}
