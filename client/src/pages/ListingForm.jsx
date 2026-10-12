import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, CAT_EMOJI, UNITS } from '../utils/constants';

export const ListingForm = ({ editingProduct, setPage }) => {
  const { user, authFetch } = useAuth();
  const { toast } = useToast();

  const isEdit = Boolean(editingProduct);

  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState(editingProduct?.category || 'Vegetables');
  const [harvestDate, setHarvestDate] = useState(
    editingProduct?.harvestDate ? new Date(editingProduct.harvestDate).toISOString().slice(0, 10) : ''
  );
  const [qty, setQty] = useState(editingProduct?.qty || '');
  const [unit, setUnit] = useState(editingProduct?.unit || 'kg');
  const [price, setPrice] = useState(editingProduct?.price || '');
  const [location, setLocation] = useState(editingProduct?.location || user?.location || '');
  const [desc, setDesc] = useState(editingProduct?.desc || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !harvestDate || !qty || Number(qty) < 1 || !price || Number(price) < 0 || !location) {
      toast('Please complete all required fields.', 'warn');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        category,
        harvestDate,
        qty: Number(qty),
        unit,
        price: Number(price),
        location,
        desc,
      };

      if (isEdit) {
        await authFetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast('✅ Listing updated successfully!');
      } else {
        await authFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast('🌱 Listing saved! Your harvest is now available for pre-order.');
      }

      setPage('dashboard');
    } catch (err) {
      toast(err.message || 'Error saving listing', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="card form-card">
        <button className="btn ghost sm" onClick={() => setPage('dashboard')}>
          ← Back to dashboard
        </button>

        <h2 style={{ color: 'var(--deep)', margin: '14px 0 4px' }}>
          {isEdit ? '✏️ Edit Product Listing' : '➕ Add Product Listing'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '18px' }}>
          {isEdit
            ? 'Update the details below — buyers will see the latest harvest schedule and pricing.'
            : 'Enter your harvest details — once saved, your product appears in the marketplace for pre-order.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Product name / Variety *</label>
            <input
              required
              placeholder="e.g. Sweet Corn, Dinorado Rice, Organic Tomatoes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {(CAT_EMOJI[c] || '') + ' ' + c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Harvest date *</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="field">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="100"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Unit *</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Price per unit (₱) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="45"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Farm location *</label>
            <input
              required
              placeholder="e.g. Nueva Ecija, Benguet, Davao"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Farming method, organic certification, packaging, ripeness, delivery schedule..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save listing'}
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => setPage('dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingForm;
