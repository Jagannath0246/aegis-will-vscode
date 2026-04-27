// src/pages/manageAssets.js
import { state } from '../utils/state.js'
import { toast, closeModal, ASSET_ICONS, shortAddr } from '../utils/helpers.js'
import { updateStats } from '../utils/stats.js'
import { addActivity } from '../components/activity.js'

export function renderAssetsPage(filter = '') {
  const list = document.getElementById('assets-list')
  let assets = state.assets
  if (filter) assets = assets.filter(a => a.type.includes(filter))

  if (!assets.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">💎</div>
        <div style="font-weight:600; margin-bottom:4px;">No Assets Added</div>
        <div class="text-sm">Add your crypto assets to include them in your will</div>
        <button class="btn btn-primary mt-2" id="add-asset-empty-btn">Add First Asset</button>
      </div>`
    document.getElementById('add-asset-empty-btn')?.addEventListener('click', () => {
      import('../main.js').then(m => m.openAddAssetModal())
    })
    return
  }

  list.innerHTML = assets.map(a => `
    <div class="asset-row">
      <div class="asset-icon" style="background:var(--bg3);">${ASSET_ICONS[a.type] || '💎'}</div>
      <div class="asset-info">
        <div class="asset-name">${a.name} <span class="badge draft">${a.type}</span></div>
        <div class="asset-addr">${a.willId ? 'Assigned to will' : 'Unassigned'}</div>
      </div>
      <div class="asset-val">
        <div class="asset-amount">${a.amount}</div>
      </div>
      <button class="btn btn-danger btn-sm delete-asset-btn" data-id="${a.id}">✕</button>
    </div>`).join('')

  list.querySelectorAll('.delete-asset-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteAsset(btn.dataset.id))
  })
}

function deleteAsset(id) {
  state.assets = state.assets.filter(a => String(a.id) !== String(id))
  renderAssetsPage()
  updateStats()
  toast('Asset removed.', 'info')
}

export function refreshWillSelectOptions(selectId) {
  const sel = document.getElementById(selectId)
  if (!sel) return
  sel.innerHTML = '<option value="">— Unassigned —</option>' +
    state.wills.map(w => `<option value="${w.id}">${w.name}</option>`).join('')
}

export function saveAsset() {
  const type     = document.getElementById('ma-asset-type').value
  const name     = document.getElementById('ma-asset-name').value.trim()
  const amount   = document.getElementById('ma-asset-amount').value.trim()
  const contract = document.getElementById('ma-asset-contract').value.trim()
  const willId   = document.getElementById('ma-asset-will').value

  if (!name || !amount) { toast('Asset name and amount required.', 'error'); return }
  state.assets.push({ id: Date.now(), type, name, amount, contract, willId })
  closeModal('add-asset-modal')
  renderAssetsPage()
  updateStats()
  addActivity('💎', 'Asset Added', name + ' · ' + amount, 'rgba(59,130,246,0.15)', 'var(--blue2)')
  toast('Asset added!', 'success')
}
