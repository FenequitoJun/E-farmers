import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, CAT_EMOJI, money, fmtDate, isPreorder } from '../utils/constants';

export const Marketplace = ({ setPage, setSelectedProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [loc, setLoc] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [avail, setAvail] = useState('all');
  const [sort, setSort] = useState('new');
  const [inStock, setInStock] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (cat && cat !== 'all') params.append('category', cat);
      if (loc) params.append('location', loc);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (avail && avail !== 'all') params.append('availability', avail);
      if (sort) params.append('sort', sort);
      if (inStock) params.append('inStock', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
    } finally {
      setLoading(false);
    }
  }, [q, cat, loc, maxPrice, avail, sort, inStock]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleReset = () => {
    setQ('');
    setCat('all');
    setLoc('');
    setMaxPrice('');
    setAvail('all');
    setSort('new');
    setInStock(false);
  };

  const openProduct = (id) => {
    setSelectedProductId(id);
    setPage('product-detail');
    window.scrollTo(0, 0);
  };

  return (
    <div className="container">
      <div className="dash-head">
        <div>
          <h2>🛒 Marketplace</h2>
          <small style={{ color: 'var(--muted)' }}>
            Browse fresh harvests directly from local farmers available for pre-order.
          </small>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filters">
        <input
          className="grow"
          placeholder="🔍 Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">🏷 All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {(CAT_EMOJI[c] || '') + ' ' + c}
            </option>
          ))}
        </select>

        <input
          placeholder="📍 Location"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={avail} onChange={(e) => setAvail(e.target.value)}>
          <option value="all">Any availability</option>
          <option value="available">Available now</option>
          <option value="preorder">Pre-order</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating">Top rated</option>
        </select>

        <label className="f-check">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />{' '}
          In stock
        </label>

        <button className="btn ghost sm" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--muted)' }}>
          Loading fresh harvests...
        </div>
      ) : products.length > 0 ? (
        <div className="mgrid">
          {products.map((p) => {
            const pre = isPreorder(p.harvestDate);
            const soldOut = p.qty <= 0;

            return (
              <article
                key={p._id}
                className={`pcard ${soldOut ? 'soldout' : ''}`}
                onClick={() => openProduct(p._id)}
              >
                <div className="pcard-img">
                  {CAT_EMOJI[p.category] || '🌱'}
                  <span
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                    className={`badge ${soldOut ? 'b-gray' : pre ? 'b-amber' : 'b-green'}`}
                  >
                    {soldOut ? 'Sold out' : pre ? 'Pre-order' : 'Available'}
                  </span>
                </div>

                <div className="pcard-body">
                  <h3>{p.name}</h3>
                  <div className="pcard-meta">
                    🧑‍🌾 {p.farmer?.name || 'Local Farm'} · 📍 {p.location}
                  </div>
                  <div className="pcard-row">
                    <span className="price">
                      {money(p.price)}
                      <small style={{ fontWeight: 500, color: 'var(--muted)' }}>
                        /{p.unit}
                      </small>
                    </span>
                    <span className="stock">
                      {p.qty > 0 ? `${p.qty} ${p.unit} left` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="pcard-harvest">
                    <span>🗓 Harvest: {fmtDate(p.harvestDate)}</span>
                    {p.avgRating ? (
                      <span className="stars" style={{ fontSize: '12px' }}>
                        ★ {Number(p.avgRating).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <div className="big">🧺</div>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or resetting filters.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
