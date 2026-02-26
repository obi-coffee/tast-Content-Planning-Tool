import { useState, useMemo } from "react";
import { driveThumb, STAGE_META, Tag, Modal, ContentForm, flattenChannels } from "./Components.jsx";
import { Avatar } from "./components/Avatar.jsx";

const CHANNEL = "Instagram";

// ── Placeholder tile when no image ────────────────────────────────────────
function PlaceholderTile({ item, size }) {
  const stage = item?.stage || "Idea";
  const color = STAGE_META[stage]?.color || "#a8a29e";
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1 px-2"
      style={{ background: color + "18" }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: color + "33" }}>
        <span style={{ color, fontSize: 12 }}>✦</span>
      </div>
      {size !== "sm" && (
        <p className="text-center font-medium leading-tight" style={{ color, fontSize: size === "lg" ? 11 : 9, maxWidth: "90%" }}>
          {item?.title || "Empty"}
        </p>
      )}
    </div>
  );
}

// ── Single grid cell ───────────────────────────────────────────────────────
function GridCell({ item, index, isHighlighted, onClick, size = "md" }) {
  const thumb = item ? driveThumb(item.driveUrl) : null;
  const [imgErr, setImgErr] = useState(false);
  const stage = item?.stage || "Idea";
  const color = STAGE_META[stage]?.color || "#e7e5e4";

  const cellSize = size === "lg" ? 180 : size === "sm" ? 80 : 130;

  return (
    <div
      onClick={() => item && onClick(item)}
      className="relative overflow-hidden flex-shrink-0 transition-all"
      style={{
        width: cellSize,
        height: cellSize,
        cursor: item ? "pointer" : "default",
        outline: isHighlighted ? `3px solid #F05881` : "3px solid transparent",
        outlineOffset: -3,
        background: "#f7f6f5",
      }}
    >
      {thumb && !imgErr ? (
        <img
          src={thumb}
          alt={item?.title}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <PlaceholderTile item={item} size={size} />
      )}

      {/* Hover overlay */}
      {item && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}>
          <div className="p-2">
            <p className="text-white font-semibold leading-tight" style={{ fontSize: size === "sm" ? 8 : 10 }}>{item.title}</p>
            {size !== "sm" && item.date && (
              <p className="text-white/70" style={{ fontSize: 9 }}>{item.date}</p>
            )}
          </div>
        </div>
      )}

      {/* Stage dot */}
      {item && (
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full shadow-sm"
          style={{ background: color, border: "1.5px solid white" }} />
      )}

      {/* Carousel indicator */}
      {item && item.driveUrls?.length > 1 && (
        <div className="absolute top-1.5 left-1.5 bg-black/50 rounded px-1 py-0.5 flex items-center gap-0.5">
          <span style={{ color: "white", fontSize: 8 }}>⧉</span>
          <span style={{ color: "white", fontSize: 8 }}>{item.driveUrls.length}</span>
        </div>
      )}

      {/* Empty slot number */}
      {!item && (
        <span className="absolute inset-0 flex items-center justify-center text-stone-300 font-medium" style={{ fontSize: 11 }}>
          #{index + 1}
        </span>
      )}
    </div>
  );
}

// ── Detail panel ───────────────────────────────────────────────────────────
function DetailPanel({ item, campaigns, onClose, onEdit }) {
  const campaign = campaigns.find(c => String(c.id) === String(item.campaignId));
  const thumb = driveThumb(item.driveUrl);
  const [imgErr, setImgErr] = useState(false);
  const stage = item.stage || "Idea";
  const stageColor = STAGE_META[stage]?.color || "#a8a29e";

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-xl overflow-hidden" style={{ maxWidth: 380 }}>
      {/* Image */}
      <div className="w-full bg-stone-100 relative" style={{ height: 220 }}>
        {thumb && !imgErr ? (
          <img src={thumb} alt={item.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <PlaceholderTile item={item} size="lg" />
        )}
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 transition-colors">
          ✕
        </button>
        {item.driveUrls?.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {item.driveUrls.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? "white" : "rgba(255,255,255,0.5)" }} />
            ))}
          </div>
        )}
      </div>

      {/* Carousel strip */}
      {item.driveUrls?.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto">
          {item.driveUrls.map((url, i) => (
            <img key={i} src={driveThumb(url)} alt={`slide ${i+1}`}
              className="w-12 h-12 rounded-md object-cover shrink-0 border-2"
              style={{ borderColor: i === 0 ? "#F05881" : "transparent" }}
              onError={e => e.target.style.display = "none"} />
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-stone-800 text-base leading-tight">{item.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ background: stageColor + "22", color: stageColor }}>{stage}</span>
        </div>

        {campaign && (
          <p className="text-xs mb-2 font-medium" style={{ color: "#F05881" }}>↗ {campaign.name}</p>
        )}

        {item.draftCopy && (
          <div className="bg-stone-50 rounded-lg p-3 mb-3">
            <p className="text-xs text-stone-500 leading-relaxed">{item.draftCopy}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{item.date || "No date set"}</span>
          {item.assigneeId && <Avatar memberId={item.assigneeId} size={20} showName />}
        </div>

        <button onClick={() => onEdit(item)}
          style={{ background: "#F05881" }}
          className="mt-3 w-full text-white text-sm py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Edit post
        </button>
      </div>
    </div>
  );
}

// ── Main Grid View ─────────────────────────────────────────────────────────
export function InstagramGrid({ items, setItems, campaigns, products, setProducts, currentMember }) {
  const [selected, setSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [gridSize, setGridSize] = useState("md");
  const [filter, setFilter] = useState("all"); // all | scheduled | unscheduled | published

  // Only Instagram posts, sorted by date then by created
  const igItems = useMemo(() => {
    return items
      .filter(i => {
        return flattenChannels(i.channels).includes(CHANNEL);
      })
      .filter(i => {
        if (filter === "scheduled") return i.date && i.stage !== "Published";
        if (filter === "unscheduled") return !i.date;
        if (filter === "published") return i.stage === "Published";
        return true;
      })
      .sort((a, b) => {
        if (a.date && b.date) return a.date.localeCompare(b.date);
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
      });
  }, [items, filter]);

  // Build 3-col grid, pad to fill last row
  const gridItems = useMemo(() => {
    const padded = [...igItems];
    while (padded.length % 3 !== 0) padded.push(null);
    // Show at least 9 slots
    while (padded.length < 9) padded.push(null);
    return padded;
  }, [igItems]);

  // Split into rows of 3
  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < gridItems.length; i += 3) r.push(gridItems.slice(i, i + 3));
    return r;
  }, [gridItems]);

  const saveItem = form => {
    if (editItem?.id) setItems(prev => prev.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i));
    else setItems(prev => [{ ...form, id: Date.now() }, ...prev]);
  };

  const cellSize = gridSize === "lg" ? 180 : gridSize === "sm" ? 80 : 130;
  const gap = 3;

  // Stats
  const publishedCount = igItems.filter(i => i.stage === "Published").length;
  const scheduledCount = igItems.filter(i => i.date && i.stage !== "Published").length;
  const unscheduledCount = igItems.filter(i => !i.date).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Instagram Grid</h2>
          <p className="text-xs text-stone-400 mt-0.5">{igItems.length} post{igItems.length !== 1 ? "s" : ""} · visual feed preview</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Size toggle */}
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            {[["sm", "S"], ["md", "M"], ["lg", "L"]].map(([v, l]) => (
              <button key={v} onClick={() => setGridSize(v)}
                className="text-xs px-2.5 py-1.5 rounded-md font-medium transition-all"
                style={gridSize === v ? { background: "#F05881", color: "white" } : { color: "#78716c" }}>
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setEditItem({ channels: ["Instagram"], stage: "Idea", type: "Product Launch" }); setShowEditForm(true); }}
            style={{ background: "#F05881" }}
            className="text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90">
            + Add post
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          ["all", `All (${igItems.length})`],
          ["scheduled", `Scheduled (${scheduledCount})`],
          ["published", `Published (${publishedCount})`],
          ["unscheduled", `Unscheduled (${unscheduledCount})`],
        ].map(([v, l]) => (
          <button key={v} onClick={() => { setFilter(v); setSelected(null); }}
            className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
            style={filter === v
              ? { background: "#F05881", color: "white", borderColor: "#F05881" }
              : { background: "white", color: "#78716c", borderColor: "#e7e5e4" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex gap-6 items-start">
        {/* Grid */}
        <div className="flex-shrink-0">
          {/* Phone frame */}
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-stone-800 bg-stone-800 inline-block">
            {/* Notch bar */}
            <div className="h-6 bg-stone-800 flex items-center justify-center">
              <div className="w-16 h-1.5 rounded-full bg-stone-600" />
            </div>
            {/* IG top bar */}
            <div className="bg-white flex items-center justify-between px-3 py-2 border-b border-stone-100" style={{ width: (cellSize * 3) + (gap * 2) }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "#F05881" }}>t</div>
                <span className="text-xs font-semibold text-stone-800">tāst.coffee</span>
              </div>
              <div className="flex gap-3">
                <span className="text-stone-400 text-sm">＋</span>
                <span className="text-stone-400 text-sm">☰</span>
              </div>
            </div>
            {/* IG profile stub */}
            <div className="bg-white px-3 py-2.5 flex items-center gap-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg,#F05881,#a12f52)" }}>t</div>
              <div>
                <p className="text-xs font-semibold text-stone-800">tāst coffee</p>
                <p className="text-xs text-stone-400">Coffee for the Live Ones</p>
              </div>
            </div>
            {/* Grid */}
            <div className="bg-white" style={{ width: (cellSize * 3) + (gap * 2) }}>
              {rows.map((row, ri) => (
                <div key={ri} className="flex" style={{ gap }}>
                  {row.map((item, ci) => {
                    const idx = ri * 3 + ci;
                    return (
                      <GridCell
                        key={idx}
                        item={item}
                        index={idx}
                        isHighlighted={selected?.id === item?.id}
                        onClick={setSelected}
                        size={gridSize}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Bottom bar */}
            <div className="bg-white h-8 flex items-center justify-around px-4 border-t border-stone-100">
              {["⌂", "🔍", "＋", "♡", "◯"].map((icon, i) => (
                <span key={i} className="text-stone-400" style={{ fontSize: 14 }}>{icon}</span>
              ))}
            </div>
            {/* Home indicator */}
            <div className="h-5 bg-stone-800 flex items-center justify-center">
              <div className="w-20 h-1 rounded-full bg-stone-600" />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(STAGE_META).map(([s, m]) => (
              <div key={s} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                <span className="text-xs text-stone-400">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <DetailPanel
              item={selected}
              campaigns={campaigns}
              onClose={() => setSelected(null)}
              onEdit={item => { setEditItem(item); setSelected(null); setShowEditForm(true); }}
            />
          ) : (
            <div className="text-center py-12 text-stone-300">
              <p className="text-4xl mb-3">◫</p>
              <p className="text-sm">Tap a post to preview details</p>
              {igItems.length === 0 && (
                <p className="text-xs mt-2 text-stone-300">No Instagram posts yet — add one to get started</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditForm && (
        <Modal title={editItem?.id ? "Edit Post" : "New Instagram Post"} onClose={() => { setShowEditForm(false); setEditItem(null); }}>
          <ContentForm
            initial={editItem}
            campaigns={campaigns}
            onSave={saveItem}
            onDelete={editItem?.id ? () => setItems(prev => prev.filter(i => i.id !== editItem.id)) : null}
            onClose={() => { setShowEditForm(false); setEditItem(null); }}
            products={products}
            setProducts={setProducts}
            currentMember={currentMember}
          />
        </Modal>
      )}
    </div>
  );
}
