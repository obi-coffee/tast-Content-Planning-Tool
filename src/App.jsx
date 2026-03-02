import { useState } from "react";
import { defaultBrandVoice } from "./Components.jsx";
import { Pipeline, Calendar, BrandVoice, Captions } from "./Views.jsx";
import { Campaigns } from "./Campaigns.jsx";
import { InstagramGrid } from "./InstagramGrid.jsx";
import { Analytics } from "./Analytics.jsx";
import { useContent, useCampaigns, useProducts, useBrandVoice } from "./hooks/useContent.js";
import { useTeamMember } from "./hooks/useTeamMember.js";
import TeamPicker from "./components/TeamPicker.jsx";
import { Avatar } from "./components/Avatar.jsx";

const TABS = ["Pipeline", "Calendar", "Campaigns", "Grid", "Analytics", "Brand Voice", "Captions"];

export default function App() {
  const [tab, setTab] = useState(0);

  // ── All data from Supabase ──────────────────────────────────────────────
  const { items,     loading: itemsLoading,     addItem,      updateItem,      deleteItem      } = useContent();
  const { campaigns, loading: campaignsLoading, addCampaign,  updateCampaign,  deleteCampaign  } = useCampaigns();
  const { products,  loading: productsLoading,  addProduct,   deleteProduct                    } = useProducts();
  const { voice: brandVoice, setVoice: setBrandVoice                                           } = useBrandVoice(defaultBrandVoice);

  // ── Team identity (localStorage is correct here — per-device preference) ─
  const { member, showPicker, chooseMember, switchMember } = useTeamMember();

  // ── Products adapter (views expect setProducts(fn) shape) ──────────────
  const setProducts = async (updater) => {
    const next = typeof updater === "function" ? updater(products) : updater;
    const added   = next.filter(n => !products.some(o => o.id === n.id));
    const removed = products.filter(o => !next.some(n => n.id === o.id));
    for (const p of added)   { const { id, ...rest } = p; await addProduct(rest).catch(console.error); }
    for (const p of removed) { await deleteProduct(p.id).catch(console.error); }
  };

  const loading = itemsLoading || campaignsLoading || productsLoading;

  return (
    <>
      {showPicker && <TeamPicker onChoose={chooseMember} />}

      <div className="min-h-screen bg-stone-50 font-sans">
        {/* ── Header ── */}
        <div className="bg-white border-b border-stone-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800 text-lg tracking-tight">tāst</span>
              <span className="text-stone-400 text-sm ml-2">content ops</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 hidden sm:block">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {member && (
                <button onClick={switchMember} title="Switch member" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <Avatar memberId={member.id} size={28} showName />
                </button>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-1">
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)}
                  className="text-sm px-3 py-2.5 border-b-2 whitespace-nowrap font-medium transition-colors"
                  style={tab === i ? { borderColor: "#F05881", color: "#F05881" } : { borderColor: "transparent", color: "#a8a29e" }}>
                  {t}
                  {t === "Pipeline" && items.length > 0 && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#fff0f4", color: "#F05881" }}>{items.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-[#F05881] animate-spin mx-auto mb-3" />
                <p className="text-sm text-stone-400">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {tab === 0 && <Pipeline    items={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} />}
              {tab === 1 && <Calendar    items={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} />}
              {tab === 2 && <Campaigns   campaigns={campaigns} addCampaign={addCampaign} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} allItems={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} products={products} setProducts={setProducts} currentMember={member} />}
              {tab === 3 && <InstagramGrid items={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} campaigns={campaigns} products={products} setProducts={setProducts} currentMember={member} />}
              {tab === 4 && <Analytics   items={items} campaigns={campaigns} />}
              {tab === 5 && <BrandVoice  voice={brandVoice} setVoice={setBrandVoice} />}
              {tab === 6 && <Captions    brandVoice={brandVoice} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
