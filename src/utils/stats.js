// src/utils/stats.js
import { state } from './state.js'

export function updateStats() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val }

  set('stat-wills',   state.wills.length)
  set('stat-benes',   state.beneficiaries.length)
  set('stat-assets',  state.assets.length)
  set('stat-network', state.walletNetwork || '—')

  const alloc = state.assets.length
    ? Math.round((state.assets.filter(a => a.willId).length / state.assets.length) * 100)
    : 0
  set('ma-total-assets', state.assets.length)
  set('ma-allocated',    alloc + '%')
  set('ma-eth-balance',  state.walletBalance || '—')

  set('bene-count',    state.beneficiaries.length)
  set('bene-verified', state.beneficiaries.filter(b => b.address?.startsWith('0x')).length)
  set('bene-pending',  state.beneficiaries.filter(b => !b.address?.startsWith('0x')).length)
}
