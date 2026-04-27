// src/pages/dashboard.js
import { state } from '../utils/state.js'
import { shortAddr, toast, openModal } from '../utils/helpers.js'
import { openModal as _openModal, closeModal } from '../utils/helpers.js'

export function renderDashboardWills() {
  const list = document.getElementById('dashboard-wills-list')
  if (!state.wills.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <div style="font-weight:600; margin-bottom:4px;">No Wills Created Yet</div>
        <div class="text-sm">Connect your wallet and create your first will</div>
        <button class="btn btn-primary mt-2" id="dash-create-btn">Create New Will</button>
      </div>`
    document.getElementById('dash-create-btn')?.addEventListener('click', () => {
      import('../main.js').then(m => m.nav('create-will'))
    })
    return
  }
  list.innerHTML = state.wills.map(w => `
    <div class="will-card" data-will-id="${w.id}">
      <div class="will-card-hd">
        <div>
          <div class="will-title">📝 ${w.name}</div>
          <div class="will-meta">${w.type} · Created ${w.createdAt}</div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
          <span class="badge active">● Active</span>
          ${w.onChain ? '<span class="badge" style="background:rgba(34,211,238,0.15);color:var(--cyan);">⛓ On-Chain</span>' : ''}
        </div>
      </div>
      <div class="flex gap-2 mt-2" style="font-size:0.78rem; color:var(--text3);">
        <span>👥 ${w.beneficiaries.length} beneficiaries</span>
        <span>💎 ${w.assets.length} assets</span>
        <span>⏱ ${w.trigger}d trigger</span>
      </div>
      ${w.txHash ? `<div class="mt-1" style="font-size:0.7rem;color:var(--text3);font-family:monospace;">TX: ${w.txHash.slice(0,20)}...</div>` : ''}
      <div class="mt-2">
        <div class="progress"><div class="progress-fill green" style="width:100%"></div></div>
      </div>
    </div>`).join('')

  list.querySelectorAll('.will-card').forEach(card => {
    card.addEventListener('click', () => showWillDetail(parseInt(card.dataset.willId)))
  })
}

export function showWillDetail(id) {
  const w = state.wills.find(x => x.id === id)
  if (!w) return
  document.getElementById('wdm-title').textContent = w.name
  document.getElementById('wdm-content').innerHTML = `
    <div class="card mb-2" style="background:var(--bg2);">
      <div class="form-row">
        <div><div class="text-xs text-muted">Type</div><div>${w.type}</div></div>
        <div><div class="text-xs text-muted">Status</div><span class="badge active">Active</span></div>
      </div>
      <div class="form-row mt-1">
        <div><div class="text-xs text-muted">Created</div><div>${w.createdAt}</div></div>
        <div><div class="text-xs text-muted">Trigger</div><div>${w.trigger} days inactivity</div></div>
      </div>
      ${w.executor ? `<div class="mt-1"><div class="text-xs text-muted">Executor</div><div>${w.executor}</div></div>` : ''}
    </div>
    <div class="form-row">
      <div class="card" style="background:var(--bg2);">
        <div class="text-xs text-muted mb-1">Beneficiaries</div>
        ${w.beneficiaries.map(b => `<div class="text-sm">${b.name} (${b.share}%)</div>`).join('') || '<div class="text-sm text-muted">None</div>'}
      </div>
      <div class="card" style="background:var(--bg2);">
        <div class="text-xs text-muted mb-1">Assets</div>
        ${w.assets.map(a => `<div class="text-sm">${a.name}: ${a.amount}</div>`).join('') || '<div class="text-sm text-muted">None</div>'}
      </div>
    </div>
    <div class="card mt-2" style="background:var(--bg2);">
      <div class="text-xs text-muted mb-1">Transaction Hash</div>
      <div class="font-mono text-xs text-cyan">${w.txHash}</div>
    </div>`

  document.getElementById('wdm-delete').onclick = () => deleteWill(id)
  openModal('will-detail-modal')
}

function deleteWill(id) {
  if (!confirm('Are you sure you want to delete this will?')) return
  state.wills = state.wills.filter(w => w.id !== id)
  import('../utils/stats.js').then(m => m.updateStats())
  renderDashboardWills()
  closeModal('will-detail-modal')
  toast('Will deleted.', 'info')
  import('../components/activity.js').then(m =>
    m.addActivity('🗑️', 'Will Deleted', '', 'rgba(239,68,68,0.15)', 'var(--red)'))
}

export function setContractAddress() {
  const val = document.getElementById('contract-addr-input').value.trim()
  if (!val.startsWith('0x') || val.length < 40) { toast('Invalid contract address.', 'error'); return }
  state.contractAddress = val
  document.getElementById('linked-contract').textContent = shortAddr(val)
  // Persist to localStorage so it survives page refresh
  import('../utils/contractManager.js').then(m => m.saveContractToStorage(val, 'Linked Contract'))
  toast('Contract linked: ' + shortAddr(val), 'success')
  import('./security.js').then(m => m.renderSecurity())
  import('../components/activity.js').then(m =>
    m.addActivity('🔗', 'Contract Linked', shortAddr(val), 'rgba(34,211,238,0.15)', 'var(--cyan)'))
}

export function copyContract() {
  if (!state.contractAddress) { toast('No contract linked.', 'error'); return }
  navigator.clipboard.writeText(state.contractAddress)
  toast('Contract address copied!', 'success')
}
