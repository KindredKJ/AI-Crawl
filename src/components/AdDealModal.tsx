import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ShoppingBag } from 'lucide-react';
import { AdDeal, ALL_PRODUCTS } from '../game/shopProducts';
import { applyRewards, openCheckout } from '../game/iap';

interface Props {
  deal: AdDeal;
  onClose: () => void;
  onRewardClaimed: (messages: string[]) => void;
}

export function AdDealModal({ deal, onClose, onRewardClaimed }: Props) {
  const [watching, setWatching] = useState(false);
  const [done, setDone] = useState(false);
  const linkedProduct = ALL_PRODUCTS.find(p => p.id === deal.linkedProductId);

  const handleWatchAd = () => {
    setWatching(true);
    // Simulate a 5-second ad view (replace with real ad SDK call in production)
    setTimeout(() => {
      setWatching(false);
      setDone(true);
      const msgs = applyRewards([deal.reward]);
      onRewardClaimed(msgs);
    }, 5000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm rounded-3xl border border-teal-500/30 bg-[#0f1729] p-6 relative"
        >
          {!watching && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="text-4xl mb-3 text-center">{deal.emoji}</div>

          {!done ? (
            <>
              <h2 className="text-xl font-black text-white text-center mb-1">{deal.headline}</h2>
              <p className="text-sm text-slate-400 text-center mb-6">{deal.subline}</p>

              {watching ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
                  <p className="text-sm text-slate-400">Ad playing… don't close this</p>
                </div>
              ) : (
                <>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWatchAd}
                    className="w-full py-3 rounded-2xl font-bold text-black bg-teal-400 flex items-center justify-center gap-2 mb-3"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch Ad — Get {deal.reward.label} Free
                  </motion.button>

                  {linkedProduct && (
                    <button
                      onClick={() => { openCheckout(linkedProduct.id, 'player'); onClose(); }}
                      className="w-full py-2.5 rounded-2xl font-semibold text-sm text-teal-400 border border-teal-500/30 flex items-center justify-center gap-2 hover:bg-teal-500/10 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Or buy {linkedProduct.name} for ${linkedProduct.priceUsd.toFixed(2)}
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-black text-white mb-2">Reward Claimed!</h2>
              <p className="text-teal-400 font-bold mb-6">{deal.reward.label} added to your account</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-3 rounded-2xl font-bold text-black bg-teal-400"
              >
                Back to Battle
              </motion.button>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-600 mt-3">
            Ads are optional. You can always skip.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
