import { useState, useMemo } from "react";
import { driveThumb, STAGE_META, Tag, Modal, ContentForm, flattenChannels, EmptyState, CommentBadge } from "./Components.jsx";
import { Avatar } from "./components/Avatar.jsx";

const CHANNEL = "Instagram";

// iPhone 15 Pro dimensions at ~0.45 scale
const PHONE_W = 178;
const PHONE_H = 386;
const CELL_SIZE = Math.floor((PHONE_W - 2) / 3); // 3 columns, 1px gaps
const CELL_GAP = 1;

function PlaceholderTile({ item, size }) {
  const stage = item?.stage || "Idea";
  const color = STAGE_META[stage]?.color || "#a8a29e";
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-0.5 px-1"
      style={{ background: color + "18" }}
    >
      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: color + "33" }}>
        <span style={{ color, fontSize: 8 }}>{"*"}</span>
      </div>
      {size !== "sm" && (
        <p className="text-center font-medium leading-tight" style={{ color, fontSize: 7, maxWidth: "90%" }}>
          {item?.title || "Empty"}
        </p>
      )}
    </div>
  );
}

function GridCell({ item, index, isHighlighted, onClick }) {
  const thumb = item ? driveThumb(item.driveUrl) : null;
  const [imgErr, setImgErr] = useState(false);
  const stage = item?.stage || "Idea";
  const color = STAGE_META[stage]?.color || "#e7e5e4";

  return (
    <div
      onClick={() => item && onClick(item)}
      className="relative overflow-hidden flex-shrink-0"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        cursor: item ? "pointer" : "default",
        outline: isHighlighted ? "2px solid #F05881" : "2px solid transparent",
        outlineOffset: -2,
        background: "#f7f6f5",
      }}
    >
      {thumb && !imgErr ? (
        <img src={thumb} alt={item?.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
      ) : (
        <PlaceholderTile item={item} size="sm" />
      )}

      {item && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}>
          <div className="p-1">
            <p className="text-white font-semibold leading-tight" style={{ fontSize: 8 }}>{item.title}</p>
          </div>
        </div>
      )}

      {item && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full shadow-sm"
          style={{ background: color, border: "1px solid white" }} />
      )}

      {item && item.driveUrls?.length > 1 && (
        <div className="absolute top-1 left-1 bg-black/50 rounded px-0.5 py-px flex items-center gap-px">
          <span style={{ color: "white", fontSize: 6 }}>{"+"}{item.driveUrls.length}</span>
        </div>
      )}

      {!item && (
        <span className="absolute inset-0 flex items-center justify-center text-rich-black/15 font-medium" style={{ fontSize: 9 }}>
          #{index + 1}
        </span>
      )}
    </div>
  );
}

function DetailPanel({ item, campaigns, onClose, onEdit, commentCount = 0 }) {
  const campaign = campaigns.find(c => String(c.id) === String(item.campaignId));
  const thumb = driveThumb(item.driveUrl);
  const [imgErr, setImgErr] = useState(false);
  const stage = item.stage || "Idea";
  const stageColor = STAGE_META[stage]?.color || "#a8a29e";

  return (
    <div className="bg-white rounded-2xl border border-rich-black/8 shadow-xl overflow-hidden" style={{ maxWidth: 380 }}>
      <div className="w-full bg-rich-black/5 relative" style={{ height: 220 }}>
        {thumb && !imgErr ? (
          <img src={thumb} alt={item.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <PlaceholderTile item={item} size="lg" />
        )}
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 transition-colors">
          {"×"}
        </button>
        {item.driveUrls?.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {item.driveUrls.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? "white" : "rgba(255,255,255,0.5)" }} />
            ))}
          </div>
        )}
      </div>

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
          <h3 className="font-semibold text-rich-black text-base leading-tight">{item.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ background: stageColor + "22", color: stageColor }}>{stage}</span>
        </div>

        {campaign && (
          <p className="text-xs mb-2 font-medium" style={{ color: "#F05881" }}>{"↗"} {campaign.name}</p>
        )}

        {item.draftCopy && (
          <div className="bg-london-fog rounded-lg p-3 mb-3">
            <p className="text-xs text-rich-black/40 leading-relaxed">{item.draftCopy}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-rich-black/30">
          <div className="flex items-center gap-2">
            <span>{item.date || "No date set"}</span>
            {commentCount > 0 && <CommentBadge count={commentCount} />}
          </div>
          {item.assigneeId && <Avatar memberId={item.assigneeId} size={20} showName />}
        </div>

        <button onClick={() => onEdit(item)}
          className="mt-3 w-full bg-pink text-white text-sm py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Edit post
        </button>
      </div>
    </div>
  );
}

// ── Main Grid View ─────────────────────────────────────────────────────────
export function InstagramGrid({ items, addItem, updateItem, deleteItem, campaigns, products, setProducts, currentMember, commentCounts = {}, contentSeries = [] }) {
  const [selected, setSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const igItems = useMemo(() => {
    return items
      .filter(i => flattenChannels(i.channels).includes(CHANNEL))
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

  const gridItems = useMemo(() => {
    const padded = [...igItems];
    while (padded.length % 3 !== 0) padded.push(null);
    while (padded.length < 9) padded.push(null);
    return padded;
  }, [igItems]);

  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < gridItems.length; i += 3) r.push(gridItems.slice(i, i + 3));
    return r;
  }, [gridItems]);

  const saveItem = async (form) => {
    if (editItem?.id) {
      const { id, created_at, ...rest } = form;
      await updateItem(editItem.id, rest).catch(console.error);
    } else {
      const { id, ...rest } = form;
      await addItem(rest).catch(console.error);
    }
  };

  const publishedCount = igItems.filter(i => i.stage === "Published").length;
  const scheduledCount = igItems.filter(i => i.date && i.stage !== "Published").length;
  const unscheduledCount = igItems.filter(i => !i.date).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-inter text-xl font-bold text-rich-black">Instagram Grid</h2>
          <p className="text-xs text-rich-black/30 mt-0.5">{igItems.length} post{igItems.length !== 1 ? "s" : ""} · feed preview</p>
        </div>
        <button
          onClick={() => { setEditItem({ channels: { primary: "Instagram", secondary: [] }, stage: "Idea", type: "" }); setShowEditForm(true); }}
          className="bg-pink text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 font-inter">
          + Add post
        </button>
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
            className="text-xs px-3 py-1.5 rounded-full border font-medium font-inter transition-all duration-150"
            style={filter === v
              ? { background: "#F05881", color: "white", borderColor: "#F05881" }
              : { background: "white", color: "#1A1A1A60", borderColor: "#1A1A1A15" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* iPhone frame */}
        <div className="flex-shrink-0">
          <div className="inline-block rounded-[2rem] overflow-hidden shadow-2xl" style={{ background: "#1A1A1A", padding: "12px 4px" }}>
            {/* Dynamic Island */}
            <div className="flex justify-center mb-2">
              <div className="w-20 h-[22px] rounded-full bg-[#1A1A1A] relative" style={{ background: "#000" }}>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: "#1a2a1a" }} />
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ width: PHONE_W, background: "white" }}>
              {/* IG Header bar */}
              <div className="flex items-center justify-between px-3 h-[34px] border-b border-rich-black/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#F05881", fontSize: 8 }}>t</div>
                  <span className="font-semibold text-rich-black" style={{ fontSize: 10 }}>tast.coffee</span>
                  <span className="text-rich-black/30" style={{ fontSize: 8 }}>{"▾"}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-rich-black/40" style={{ fontSize: 12 }}>+</span>
                  <span className="text-rich-black/40" style={{ fontSize: 12 }}>{"☰"}</span>
                </div>
              </div>

              {/* IG Profile section */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-[52px] h-[52px] rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #F05881, #A23053)" }}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#F05881", fontSize: 16 }}>t</div>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-around text-center">
                    <div><p className="font-bold text-rich-black" style={{ fontSize: 11 }}>{igItems.length}</p><p className="text-rich-black/40" style={{ fontSize: 8 }}>posts</p></div>
                    <div><p className="font-bold text-rich-black" style={{ fontSize: 11 }}>—</p><p className="text-rich-black/40" style={{ fontSize: 8 }}>followers</p></div>
                    <div><p className="font-bold text-rich-black" style={{ fontSize: 11 }}>—</p><p className="text-rich-black/40" style={{ fontSize: 8 }}>following</p></div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <p className="font-semibold text-rich-black" style={{ fontSize: 9 }}>tast coffee</p>
                  <p className="text-rich-black/40" style={{ fontSize: 8 }}>Coffee for the Live Ones.</p>
                </div>
                <div className="mt-1.5 flex gap-1">
                  <div className="flex-1 rounded-md flex items-center justify-center bg-rich-black/5" style={{ height: 22 }}>
                    <span className="font-semibold text-rich-black" style={{ fontSize: 8 }}>Edit profile</span>
                  </div>
                  <div className="flex-1 rounded-md flex items-center justify-center bg-rich-black/5" style={{ height: 22 }}>
                    <span className="font-semibold text-rich-black" style={{ fontSize: 8 }}>Share profile</span>
                  </div>
                </div>
              </div>

              {/* Tab bar (grid/reels/tags) */}
              <div className="flex border-b border-rich-black/8">
                <div className="flex-1 flex items-center justify-center py-1.5 border-b-[1.5px] border-rich-black">
                  <span className="text-rich-black" style={{ fontSize: 12 }}>{"⊞"}</span>
                </div>
                <div className="flex-1 flex items-center justify-center py-1.5">
                  <span className="text-rich-black/25" style={{ fontSize: 12 }}>{"▶"}</span>
                </div>
                <div className="flex-1 flex items-center justify-center py-1.5">
                  <span className="text-rich-black/25" style={{ fontSize: 12 }}>{"◻"}</span>
                </div>
              </div>

              {/* Grid */}
              <div>
                {rows.map((row, ri) => (
                  <div key={ri} className="flex" style={{ gap: CELL_GAP }}>
                    {row.map((item, ci) => {
                      const idx = ri * 3 + ci;
                      return (
                        <GridCell
                          key={idx}
                          item={item}
                          index={idx}
                          isHighlighted={selected?.id === item?.id}
                          onClick={setSelected}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Bottom nav */}
              <div className="h-[32px] flex items-center justify-around px-3 border-t border-rich-black/5">
                <span style={{ fontSize: 13 }}>{"⌂"}</span>
                <span className="text-rich-black/30" style={{ fontSize: 13 }}>{"◎"}</span>
                <span className="text-rich-black/30" style={{ fontSize: 13 }}>{"+"}</span>
                <span className="text-rich-black/30" style={{ fontSize: 13 }}>{"▶"}</span>
                <div className="w-[16px] h-[16px] rounded-full bg-rich-black/10" />
              </div>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center mt-2">
              <div className="w-20 h-1 rounded-full" style={{ background: "#555" }} />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(STAGE_META).map(([s, m]) => (
              <div key={s} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                <span className="text-xs text-rich-black/30">{s}</span>
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
              commentCount={commentCounts[selected.id] || 0}
            />
          ) : (
            <div className="text-center py-12 text-rich-black/20">
              <p className="text-4xl mb-3">{"◫"}</p>
              <p className="text-sm">Tap a post to preview details</p>
              {igItems.length === 0 && (
                <p className="text-xs mt-2 text-rich-black/15">No Instagram posts yet — add one to get started</p>
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
            onDelete={editItem?.id ? () => deleteItem(editItem.id).catch(console.error) : null}
            onClose={() => { setShowEditForm(false); setEditItem(null); }}
            products={products}
            setProducts={setProducts}
            currentMember={currentMember}
            contentSeries={contentSeries}
          />
        </Modal>
      )}
    </div>
  );
}
