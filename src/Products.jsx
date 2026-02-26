import { useState } from "react";
import { Modal, Inp } from "./Components.jsx";

export const ROAST_TYPES = [
  { label: "Light Roast",       color: "#fa8f9c" },
  { label: "Medium Roast",      color: "#F05881" },
  { label: "Dark Roast",        color: "#a12f52" },
  { label: "Blend",             color: "#ef4056" },
  { label: "Decaf",             color: "#fbf9f3", border: "#e0ded8" },
  { label: "Special Release",   color: "#0000ff" },
  { label: "App",               color: "#00ff00" },
];

export function ProductDot({ color, border }) {
  return (
    <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: color, border: border ? `1px solid ${border}` : `1px solid ${color}` }} />
  );
}

// ── Product Manager Modal ──────────────────────────────────────────────────
export function ProductManager({ products, setProducts, onClose }) {
  const [name, setName] = useState("");
  const [roastIdx, setRoastIdx] = useState(0);

  const add = () => {
    if (!name.trim()) return;
    const roast = ROAST_TYPES[roastIdx];
    setProducts(prev => [...prev, { id: Date.now(), name: name.trim(), roast: roast.label, color: roast.color, border: roast.border }]);
    setName("");
  };

  const remove = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <Modal title="Product Catalog" onClose={onClose}>
      <p className="text-xs text-stone-400 mb-4">Add and manage your tāst products. These appear as options when creating content.</p>

      {/* Add form */}
      <div className="bg-stone-50 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Add New Product</p>
        <Inp label="Product name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ethiopia Anaerobic Natural" />
        <div className="mb-3">
          <label className="block text-sm font-medium text-stone-600 mb-2">Roast type</label>
          <div className="flex flex-wrap gap-2">
            {ROAST_TYPES.map((r, i) => (
              <button key={r.label} type="button" onClick={() => setRoastIdx(i)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                style={roastIdx === i
                  ? { background: r.color, color: r.color === "#fbf9f3" ? "#78716c" : "white", borderColor: r.border || r.color }
                  : { background: "white", color: "#78716c", borderColor: "#e7e5e4" }}>
                <ProductDot color={r.color} border={r.border} />
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={add} disabled={!name.trim()}
          style={name.trim() ? { background: "#F05881" } : {}}
          className="w-full disabled:bg-stone-200 disabled:text-stone-400 text-white py-2 rounded-lg font-medium text-sm transition-all">
          Add Product
        </button>
      </div>

      {/* Product list */}
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Your Products ({products.length})</p>
      {products.length === 0
        ? <p className="text-sm text-stone-300">No products yet — add your first one above.</p>
        : (
          <div className="space-y-1.5">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl border border-stone-100 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <ProductDot color={p.color} border={p.border} />
                  <div>
                    <p className="text-sm font-medium text-stone-800">{p.name}</p>
                    <p className="text-xs" style={{ color: p.color === "#fbf9f3" ? "#a8a29e" : p.color }}>{p.roast}</p>
                  </div>
                </div>
                <button onClick={() => remove(p.id)} className="text-xs text-stone-300 hover:text-red-400 transition-colors">remove</button>
              </div>
            ))}
          </div>
        )
      }
    </Modal>
  );
}

// ── Product Selector (used inside ContentForm) ─────────────────────────────
export function ProductSelector({ value, onChange, products, onManage }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-stone-600">Product</label>
        <button type="button" onClick={onManage} style={{ color: "#F05881" }} className="text-xs hover:opacity-70 font-medium">
          + Manage products
        </button>
      </div>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full border border-stone-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#F05881]/40 appearance-none">
          <option value="">No product selected</option>
          {products.map(p => (
            <option key={p.id} value={p.name}>{p.name} — {p.roast}</option>
          ))}
        </select>
        {/* Color dot overlay */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {(() => {
            const matched = products.find(p => p.name === value);
            return matched ? <ProductDot color={matched.color} border={matched.border} /> : <span className="w-2.5 h-2.5 rounded-full inline-block bg-stone-200" />;
          })()}
        </div>
      </div>
    </div>
  );
}
