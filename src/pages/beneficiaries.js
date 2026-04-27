// src/pages/beneficiaries.js
import { state } from '../utils/state.js'
import { toast, closeModal } from '../utils/helpers.js'
import { updateStats } from '../utils/stats.js'
import { addActivity } from '../components/activity.js'

export function renderBeneficiariesPage() {
  const container = document.getElementById('benes-table-container')
  if (!state.beneficiaries.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">👥</div>
        <div style="font-weight:600; margin-bottom:4px;">No Beneficiaries Added</div>
        <div class="text-sm">Add trusted individuals who will receive your assets</div>
        <button class="btn btn-primary mt-2" id="add-bene-empty-btn">Add Beneficiary</button>
      </div>`
    document.getElementById('add-bene-empty-btn')?.addEventListener('click', () => {
      import('../main.js').then(m => m.openAddBeneModal())
    })
    return
  }

  container.innerHTML = `
    <table>
      <thead><tr>
        <th>Name</th><th>Wallet Address</th><th>Relationship</th>
        <th>Share</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${state.beneficiaries.map((b, i) => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="bene-avatar" style="width:32px;height:32px;font-size:0.85rem;">${(b.name || '?')[0].toUpperCase()}</div>
                <strong>${b.name}</strong>
              </div>
            </td>
            <td class="font-mono text-xs">${b.address || '—'}</td>
            <td>${b.rel || '—'}</td>
            <td>${b.share || '—'}%</td>
            <td>
              <span class="badge ${b.address?.startsWith('0x') ? 'active' : 'pending'}">
                ${b.address?.startsWith('0x') ? '● Verified' : '⏳ Pending'}
              </span>
            </td>
            <td><button class="btn btn-danger btn-sm delete-bene-btn" data-idx="${i}">Remove</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`

  container.querySelectorAll('.delete-bene-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteBene(parseInt(btn.dataset.idx)))
  })
}

function deleteBene(i) {
  state.beneficiaries.splice(i, 1)
  renderBeneficiariesPage()
  updateStats()
  toast('Beneficiary removed.', 'info')
}

export function saveBene() {
  const name  = document.getElementById('ab-name').value.trim()
  const addr  = document.getElementById('ab-address').value.trim()
  const rel   = document.getElementById('ab-rel').value
  const share = parseInt(document.getElementById('ab-share').value) || 0

  if (!name) { toast('Name required.', 'error'); return }
  if (addr && (!addr.startsWith('0x') || addr.length < 40)) { toast('Invalid wallet address.', 'error'); return }

  state.beneficiaries.push({ name, address: addr, rel, share })
  closeModal('add-bene-modal')
  renderBeneficiariesPage()
  updateStats()
  addActivity('👤', 'Beneficiary Added', name, 'rgba(16,185,129,0.15)', 'var(--green)')
  toast('Beneficiary added!', 'success')
}
