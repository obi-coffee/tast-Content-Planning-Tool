import { useState } from "react";
import { defaultBrandVoice } from "./Components.jsx";
import { Pipeline, Calendar, BrandVoice, Captions } from "./Views.jsx";
import { Campaigns } from "./Campaigns.jsx";
import { InstagramGrid } from "./InstagramGrid.jsx";
import { Analytics } from "./Analytics.jsx";
import { useContent, useCampaigns, useProducts, useBrandVoice } from "./hooks/useContent.js";
import { useTeamMember } from "./hooks/useTeamMember.js";
import { useCommentCounts } from "./hooks/useCommentCounts.js";
import TeamPicker from "./components/TeamPicker.jsx";
import { Avatar } from "./components/Avatar.jsx";
import { ToastProvider, useToast } from "./components/Toast.jsx";

// ── Tab groups for organized navigation ───────────────────────────────────
const TAB_GROUPS = [
  {
    label: "Plan",
    tabs: [
      { id: "pipeline",  label: "Pipeline" },
      { id: "calendar",  label: "Calendar" },
      { id: "campaigns", label: "Campaigns" },
    ],
  },
  {
    label: "Create",
    tabs: [
      { id: "captions",   label: "Captions" },
      { id: "brandvoice", label: "Brand Voice" },
    ],
  },
  {
    label: "Review",
    tabs: [
      { id: "grid",      label: "Grid" },
      { id: "analytics", label: "Analytics" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap(g => g.tabs);

function AppInner() {
  const [activeTab, setActiveTab] = useState("pipeline");

  // ── All data from Supabase ──────────────────────────────────────────────
  const { items,     loading: itemsLoading,     addItem,      updateItem,      deleteItem      } = useContent();
  const { campaigns, loading: campaignsLoading, addCampaign,  updateCampaign,  deleteCampaign  } = useCampaigns();
  const { products,  loading: productsLoading,  addProduct,   deleteProduct                    } = useProducts();
  const { voice: brandVoice, setVoice: setBrandVoice                                           } = useBrandVoice(defaultBrandVoice);
  const commentCounts = useCommentCounts();
  const toast = useToast();

  // ── Team identity ───────────────────────────────────────────────────────
  const { member, showPicker, chooseMember, switchMember } = useTeamMember();

  // ── Products adapter ────────────────────────────────────────────────────
  const setProducts = async (updater) => {
    const next = typeof updater === "function" ? updater(products) : updater;
    const added   = next.filter(n => !products.some(o => o.id === n.id));
    const removed = products.filter(o => !next.some(n => n.id === o.id));
    for (const p of added)   { const { id, ...rest } = p; await addProduct(rest).catch(console.error); }
    for (const p of removed) { await deleteProduct(p.id).catch(console.error); }
  };

  const loading = itemsLoading || campaignsLoading || productsLoading;

  // ── Toast-wrapped CRUD ──────────────────────────────────────────────────
  const addItemWithToast = async (item) => {
    await addItem(item);
    toast(`"${item.title}" added`, 'success');
  };

  const updateItemWithToast = async (id, updates) => {
    await updateItem(id, updates);
    toast('Content updated', 'success');
  };

  const deleteItemWithToast = async (id) => {
    const item = items.find(i => i.id === id);
    await deleteItem(id);
    toast(`"${item?.title || 'Item'}" deleted`, 'info', item ? async () => {
      const { id: _id, created_at, ...rest } = item;
      await addItem(rest).catch(console.error);
    } : null);
  };

  const addCampaignWithToast = async (campaign) => {
    await addCampaign(campaign);
    toast(`Campaign "${campaign.name}" created`, 'success');
  };

  const deleteCampaignWithToast = async (id) => {
    const camp = campaigns.find(c => c.id === id);
    await deleteCampaign(id);
    toast(`Campaign "${camp?.name || ''}" deleted`, 'info');
  };

  return (
    <>
      {showPicker && <TeamPicker onChoose={chooseMember} />}

      <div className="min-h-screen bg-cream font-sans">
        {/* ── Header ── */}
        <div className="bg-cream border-b border-warm-divider sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl text-warm-text" style={{ fontWeight: 400 }}>tast</span>
              <span className="text-warm-muted text-sm">content ops</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-warm-muted hidden sm:block">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {member && (
                <button onClick={switchMember} title="Switch member" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <Avatar memberId={member.id} size={28} showName />
                </button>
              )}
            </div>
          </div>

          {/* ── Grouped Tabs ── */}
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-0.5 items-end">
              {TAB_GROUPS.map((group) => (
                <div key={group.label} className="flex items-end">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-muted/50 px-1.5 pb-2.5 hidden sm:block select-none">
                    {group.label}
                  </span>
                  {group.tabs.map((t) => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                      className="text-sm px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors"
                      style={activeTab === t.id
                        ? { borderColor: "#F05881", color: "#F05881", fontWeight: 600 }
                        : { borderColor: "transparent", color: "#757575", fontWeight: 400 }}>
                      {t.label}
                      {t.id === "pipeline" && items.length > 0 && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#F0588118", color: "#F05881" }}>{items.length}</span>
                      )}
                    </button>
                  ))}
                  {/* Subtle divider between groups */}
                  <div className="w-px h-4 mx-1.5 mb-2.5 hidden sm:block" style={{ background: "#e0dcd5" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-warm-border border-t-brand-300 animate-spin mx-auto mb-3" />
                <p className="text-sm text-warm-muted font-serif">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "pipeline"  && <Pipeline    items={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} />}
              {activeTab === "calendar"  && <Calendar    items={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} />}
              {activeTab === "campaigns" && <Campaigns   campaigns={campaigns} addCampaign={addCampaignWithToast} updateCampaign={updateCampaign} deleteCampaign={deleteCampaignWithToast} allItems={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} />}
              {activeTab === "grid"      && <InstagramGrid items={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} />}
              {activeTab === "analytics" && <Analytics   items={items} campaigns={campaigns} updateItem={updateItemWithToast} />}
              {activeTab === "brandvoice" && <BrandVoice  voice={brandVoice} setVoice={setBrandVoice} />}
              {activeTab === "captions"  && <Captions    brandVoice={brandVoice} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
