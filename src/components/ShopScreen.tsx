import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Zap, Package, Star, X, CheckCircle } from 'lucide-react';
import { BOOSTERS, BUNDLES, ShopProduct } from '../game/shopProducts';
import { openCheckout, applyRewards } from '../game/iap';
import { gameState } from '../game/gameState';
import { ALL_PRODUCTS } from '../game/shopProducts';

type Tab = 'boosters' | 'bundles';

export function ShopScreen() {
  const [tab, setTab] = useState<Tab>('bundles');
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const products = tab === 'boosters' ? BOOSTERS : BUNDLES;

  const handleBuy = async (product: ShopProduct) => {
    setLoading(true);
    await openCheckout(product.id, 'player');
    setLoading(false);
    setSelected(null);
  };

  return (
    <div className="pb-24 min-h-screen bg-surface">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-5 h-5 text-teal-400" />
          <h1 className="text-lg font-bold text-white">Nexus Store</h1>
        </div>
        <p className="text-xs text-slate-400">Optional boosts — never pay-to-win. All items earnable in-game.</p>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mb-4 bg-white/5 rounded-xl p-1 gap-1">
        {(['bundles', 'boosters'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
              tab === t
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'bundles' ? '📦 Bundles' : '⚡ Boosters'}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {products.map((product, i) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(product)}
            className="relative flex flex-col items-start p-3 rounded-2xl border bg-white/5 hover:bg-white/10 transition-all text-left"
            style={{ borderColor: product.accentColor + '40' }}
          >
            {/* Badge */}
            {product.badge && (
              <span
                className="absolute -top-2 -right-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: product.accentColor, color: '#000' }}
              >
                {product.badge}
              </span>
            )}

            <span className="text-2xl mb-2">{product.emoji}</span>
            <p className="text-xs font-bold text-white leading-tight mb-1">{product.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight mb-2 line-clamp-2">{product.description}</p>

            {/* Reward pills */}
            <div className="flex flex-wrap gap-1 mb-2">
              {product.rewards.slice(0, 2).map(r => (
                <span key={r.type} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {r.label}
                </span>
              ))}
              {product.rewards.length > 2 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">
                  +{product.rewards.length - 2} more
                </span>
              )}
            </div>

            <span
              className="mt-auto text-sm font-black"
              style={{ color: product.accentColor }}
            >
              ${product.priceUsd.toFixed(2)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border bg-[#1a1a2e] p-6 relative"
              style={{ borderColor: selected.accentColor + '60' }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-4xl mb-3">{selected.emoji}</div>
              <h2 className="text-xl font-black text-white mb-1">{selected.name}</h2>
              <p className="text-sm text-slate-400 mb-4">{selected.description}</p>

              {/* All rewards */}
              <div className="space-y-2 mb-6">
                {selected.rewards.map(r => (
                  <div key={r.type} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: selected.accentColor }} />
                    <span className="text-sm text-white">{r.label}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleBuy(selected)}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-lg text-black transition-all disabled:opacity-60"
                style={{ background: selected.accentColor }}
              >
                {loading ? 'Opening...' : `Buy for $${selected.priceUsd.toFixed(2)}`}
              </motion.button>

              <p className="text-center text-[10px] text-slate-500 mt-2">
                Secure payment via Stripe · No subscription
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
