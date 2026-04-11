import { useState } from "react";
import { defaultBrandVoice } from "./Components.jsx";
import { Pipeline, Calendar, BrandVoice, Captions } from "./Views.jsx";
import { Campaigns } from "./Campaigns.jsx";
import { InstagramGrid } from "./InstagramGrid.jsx";
import { Analytics } from "./Analytics.jsx";
import { useContent, useCampaigns, useProducts, useBrandVoice } from "./hooks/useContent.js";
import { useTeamMember } from "./hooks/useTeamMember.js";
import { useCommentCounts } from "./hooks/useCommentCounts.js";
import { useContentSeries } from "./hooks/useContentSeries.js";
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
  const { series: contentSeries, addSeries, updateSeries, deleteSeries } = useContentSeries();
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

      <div className="min-h-screen bg-london-fog font-inter">
        {/* ── Header ── */}
        <div className="bg-london-fog border-b border-rich-black/8 sticky top-0 z-40">
          <div className="w-full px-6 lg:px-10 flex items-center justify-between h-14">
            {/* Logo + Nav in one row */}
            <div className="flex items-center gap-8">
              <span className="text-lg font-bold text-rich-black tracking-tight shrink-0">tast</span>
              <nav className="flex items-center gap-0.5 overflow-x-auto">
                {TAB_GROUPS.map((group) => (
                  group.tabs.map((t) => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                      className="text-[13px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150 font-inter"
                      style={activeTab === t.id
                        ? { background: "#F0588112", color: "#F05881", fontWeight: 600 }
                        : { color: "#1A1A1A50", fontWeight: 500 }}>
                      {t.label}
                      {t.id === "pipeline" && items.length > 0 && (
                        <span className="ml-1 font-mono text-[10px] opacity-60">{items.length}</span>
                      )}
                    </button>
                  ))
                ))}
              </nav>
            </div>
            {/* Right side */}
            {member && (
              <button onClick={switchMember} title="Switch member" className="flex items-center gap-2 hover:opacity-70 transition-opacity shrink-0">
                <Avatar memberId={member.id} size={26} showName />
              </button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="w-full px-6 lg:px-10 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-rich-black/10 border-t-pink animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider text-rich-black/30">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "pipeline"  && <Pipeline    items={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} contentSeries={contentSeries} addSeries={addSeries} updateSeriesItem={updateSeries} deleteSeries={deleteSeries} />}
              {activeTab === "calendar"  && <Calendar    items={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} contentSeries={contentSeries} addSeries={addSeries} updateSeriesItem={updateSeries} deleteSeries={deleteSeries} />}
              {activeTab === "campaigns" && <Campaigns   campaigns={campaigns} addCampaign={addCampaignWithToast} updateCampaign={updateCampaign} deleteCampaign={deleteCampaignWithToast} allItems={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} contentSeries={contentSeries} />}
              {activeTab === "grid"      && <InstagramGrid items={items} addItem={addItemWithToast} updateItem={updateItemWithToast} deleteItem={deleteItemWithToast} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} commentCounts={commentCounts} contentSeries={contentSeries} />}
              {activeTab === "analytics" && <Analytics   items={items} campaigns={campaigns} updateItem={updateItemWithToast} contentSeries={contentSeries} />}
              {activeTab === "brandvoice" && <BrandVoice  voice={brandVoice} setVoice={setBrandVoice} />}
              {activeTab === "captions"  && <Captions    brandVoice={brandVoice} contentSeries={contentSeries} />}
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
