// ── In-App Purchase helper ─────────────────────────────────────────────────────
// Calls the Base44 createCheckout backend function and opens Stripe in a new tab
// (or Capacitor Browser plugin on native).

import { gameState } from './gameState';
import { ShopReward } from './shopProducts';

const CHECKOUT_URL = 'https://kindred-492933f1.base44.app/functions/createCheckout';

// On web the success page is the same origin + ?purchase_success=1
// On Capacitor we use the deep-link scheme
const SUCCESS_URL = window.location.origin + '/?purchase_success=1';
const CANCEL_URL  = window.location.origin + '/?purchase_cancelled=1';

export async function openCheckout(productId: string, userId?: string): Promise<void> {
  try {
    const res = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        successUrl: SUCCESS_URL,
        cancelUrl:  CANCEL_URL,
        userId: userId ?? 'anonymous',
      }),
    });
    const data = await res.json();
    if (!data.url) throw new Error(data.error ?? 'No checkout URL');
    window.open(data.url, '_blank');
  } catch (err: any) {
    console.error('openCheckout failed:', err.message);
    alert('Could not open checkout. Please try again.');
  }
}

// ── Apply rewards locally (optimistic — real validation via webhook in prod) ──
// For now we apply immediately on the client after Stripe success redirect.
// In production you'd verify via a webhook → server → entity update.
export function applyRewards(rewards: ShopReward[]): string[] {
  const messages: string[] = [];
  const state = gameState.get();
  let currencyDelta = 0;
  let newMaterials = { ...state.inventory.materials };

  for (const r of rewards) {
    switch (r.type) {
      case 'currency':
        currencyDelta += r.amount;
        messages.push(`+${r.amount.toLocaleString()} Credits`);
        break;
      case 'hp_restore': {
        const heal = Math.floor(state.maxHp * (r.amount / 100));
        gameState.update({ hp: Math.min(state.maxHp, state.hp + heal) });
        messages.push(`HP restored (+${heal})`);
        break;
      }
      case 'craft_mats': {
        // Distribute randomly across known mat IDs
        const matIds = ['nano_fiber', 'circuit_shard', 'quantum_core', 'plasma_cell', 'void_dust'];
        for (let i = 0; i < r.amount; i++) {
          const id = matIds[Math.floor(Math.random() * matIds.length)];
          newMaterials[id] = (newMaterials[id] ?? 0) + 1;
        }
        messages.push(`+${r.amount} Crafting Materials`);
        break;
      }
      case 'xp_boost':
        // Store in localStorage as battle-count remaining
        localStorage.setItem('xp_boost_remaining', String(
          (parseInt(localStorage.getItem('xp_boost_remaining') ?? '0')) + r.amount
        ));
        messages.push(`2× XP for next ${r.amount} battles`);
        break;
      case 'captures':
        localStorage.setItem('boosted_captures_remaining', String(
          (parseInt(localStorage.getItem('boosted_captures_remaining') ?? '0')) + r.amount
        ));
        messages.push(`+${r.amount} Boosted Captures`);
        break;
      case 'premium_capture':
        localStorage.setItem('guaranteed_captures_remaining', String(
          (parseInt(localStorage.getItem('guaranteed_captures_remaining') ?? '0')) + r.amount
        ));
        messages.push(`+${r.amount} Guaranteed Capture${r.amount > 1 ? 's' : ''}`);
        break;
      case 'aura_charge':
        localStorage.setItem('aura_charges_remaining', String(
          (parseInt(localStorage.getItem('aura_charges_remaining') ?? '0')) + r.amount
        ));
        messages.push(`+${r.amount} Aura Charges`);
        break;
      case 'weapon_crate':
      case 'entity_crate':
        // Flag for next time the player enters combat — award a rare drop
        localStorage.setItem(r.type + '_pending', String(
          (parseInt(localStorage.getItem(r.type + '_pending') ?? '0')) + r.amount
        ));
        messages.push(r.label);
        break;
    }
  }

  if (currencyDelta > 0) {
    gameState.update({ currency: state.currency + currencyDelta });
  }
  if (Object.keys(newMaterials).length) {
    gameState.update({ inventory: { ...state.inventory, materials: newMaterials } });
  }

  return messages;
}

// ── Check URL for purchase success on app load ──────────────────────────────
export function checkPurchaseReturn(): { productId: string | null; success: boolean } {
  const params = new URLSearchParams(window.location.search);
  const success = params.has('purchase_success');
  const productId = params.get('product_id') ?? null;
  if (success || productId) {
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
  return { productId, success };
}
