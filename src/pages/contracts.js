// src/pages/contracts.js
// Shows all deployed contracts, their on-chain data, and lets owner execute the will

import { state } from '../utils/state.js'
import { toast, shortAddr, openModal, closeModal } from '../utils/helpers.js'
import {
  loadContractData, pingContract, selfExecuteWill,
  triggerExecution, fundContract, formatTimeRemaining,
  saveContractToStorage, getSavedContracts, removeSavedContract
} from '../utils/contractManager.js'

let loadedContracts = []  // cache of on-chain data per contract
let selectedContract = null // currently viewed contract detail

// ── Render the Contracts page ──────────────────────────────────────────────
export async function renderContractsPage() {
  const container = document.getElementById('page-contracts')
  if (!container) return

  const saved = getSavedContracts()

  container.innerHTML = `
    <div class="section-hd mb-3">
      <div>
        <h2>Deployed Contracts</h2>
        <p class="subtitle">View, fund, and execute your on-chain wills</p>
      </div>
      <button class="btn btn-primary" id="load-contract-btn">+ Load Contract</button>
    </div>

    <!-- Load Contract Input -->
    <div class="card mb-3" style="border-color:rgba(34,211,238,0.2);">
      <h3 class="mb-2">🔍 Load a Deployed Contract</h3>
      <p class="text-sm text-muted mb-2">Enter any AegisWill contract address to load its on-chain data.</p>
      <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
        <input id="load-contract-addr" placeholder="Contract address (0x...)" style="flex:1; min-width:200px;" />
        <input id="load-contract-nickname" placeholder="Nickname (optional)" style="width:180px;" />
        <button class="btn btn-primary" id="do-load-contract-btn">Load & View</button>
      </div>
    </div>

    <!-- Saved Contracts List -->
    <div class="mb-3">
      <h3 class="mb-2">📋 Saved Contracts</h3>
      <div id="saved-contracts-list">
        ${saved.length === 0 ? `
          <div class="empty-state">
            <div class="icon">📄</div>
            <div style="font-weight:600; margin-bottom:4px;">No Contracts Saved Yet</div>
            <div class="text-sm">Load a contract address above to get started</div>
          </div>` : saved.map(c => `
          <div class="will-card mb-1 saved-contract-row" data-addr="${c.address}">
            <div class="will-card-hd">
              <div>
                <div class="will-title">📄 ${c.name || shortAddr(c.address)}</div>
                <div class="will-meta font-mono">${c.address}</div>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-secondary btn-sm view-contract-btn" data-addr="${c.address}" data-name="${c.name || ''}">View Details</button>
                <button class="btn btn-danger btn-sm remove-contract-btn" data-addr="${c.address}">✕</button>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Contract Detail Panel (shown after loading) -->
    <div id="contract-detail-panel" style="display:none;">
      <div class="section-hd mb-2">
        <h3>📊 Contract Details</h3>
        <button class="btn btn-ghost btn-sm" id="close-detail-btn">✕ Close</button>
      </div>
      <div id="contract-detail-content"></div>
    </div>
  `

  // ── Bind events ──────────────────────────────────────────────────────────
  document.getElementById('do-load-contract-btn')?.addEventListener('click', loadAndViewContract)
  document.getElementById('load-contract-addr')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') loadAndViewContract()
  })
  document.getElementById('close-detail-btn')?.addEventListener('click', () => {
    document.getElementById('contract-detail-panel').style.display = 'none'
  })

  // View buttons for saved contracts
  container.querySelectorAll('.view-contract-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('load-contract-addr').value = btn.dataset.addr
      loadAndViewContract()
    })
  })

  // Remove buttons
  container.querySelectorAll('.remove-contract-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSavedContract(btn.dataset.addr)
      toast('Contract removed from saved list.', 'info')
      renderContractsPage()
    })
  })

  // If there's a linked contract already, auto-load it
  if (state.contractAddress && saved.length === 0) {
    document.getElementById('load-contract-addr').value = state.contractAddress
    loadAndViewContract()
  }
}

// ── Load contract from chain and show detail ───────────────────────────────
async function loadAndViewContract() {
  const addrInput = document.getElementById('load-contract-addr')
  const nickInput = document.getElementById('load-contract-nickname')
  const addr = addrInput?.value?.trim()
  const nick = nickInput?.value?.trim()

  if (!addr || !addr.startsWith('0x') || addr.length < 40) {
    toast('Enter a valid contract address (0x...)', 'error')
    return
  }
  if (!state.walletAddress) {
    toast('Connect your wallet first.', 'error')
    return
  }

  const btn = document.getElementById('do-load-contract-btn')
  btn.textContent = '⏳ Loading...'
  btn.disabled = true

  try {
    const data = await loadContractData(addr)
    selectedContract = data

    // Save to localStorage
    saveContractToStorage(addr, nick || data.name || shortAddr(addr))
    if (nick) state.contractAddress = addr

    renderContractDetail(data)
    document.getElementById('contract-detail-panel').style.display = 'block'
    document.getElementById('contract-detail-panel').scrollIntoView({ behavior: 'smooth' })

    // Refresh saved list
    renderContractsPage()
    // Re-render detail since renderContractsPage wipes it
    setTimeout(() => {
      renderContractDetail(data)
      document.getElementById('contract-detail-panel').style.display = 'block'
    }, 50)

    toast('Contract loaded from blockchain ✅', 'success')
  } catch (err) {
    toast('Failed to load: ' + err.message, 'error')
  } finally {
    btn.textContent = 'Load & View'
    btn.disabled = false
  }
}

// ── Render the full contract detail panel ─────────────────────────────────
function renderContractDetail(data) {
  const panel = document.getElementById('contract-detail-content')
  if (!panel) return

  const isOwner = state.walletAddress?.toLowerCase() === data.owner?.toLowerCase()
  const timeLeft = formatTimeRemaining(data.timeUntilTrigger)
  const progressPct = data.inactivityThreshold > 0
    ? Math.min(100, Math.round(((data.inactivityThreshold - data.timeUntilTrigger) / data.inactivityThreshold) * 100))
    : 0

  panel.innerHTML = `
    <!-- Status Banner -->
    <div class="card mb-2" style="background:${
      data.isExecuted ? 'rgba(239,68,68,0.1)' :
      data.canExecute ? 'rgba(245,158,11,0.1)' :
      'rgba(16,185,129,0.1)'
    }; border-color:${
      data.isExecuted ? 'rgba(239,68,68,0.3)' :
      data.canExecute ? 'rgba(245,158,11,0.3)' :
      'rgba(16,185,129,0.3)'
    };">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="font-size:1.5rem; font-weight:800; font-family:var(--font-head);">${data.name}</div>
          <div class="font-mono text-xs text-muted mt-1">${data.address}</div>
        </div>
        <div style="text-align:right;">
          ${data.isExecuted
            ? '<span class="badge" style="background:rgba(239,68,68,0.2);color:var(--red);font-size:0.85rem;">🔴 EXECUTED</span>'
            : data.canExecute
            ? '<span class="badge" style="background:rgba(245,158,11,0.2);color:var(--amber);font-size:0.85rem;">⚠️ EXECUTABLE</span>'
            : '<span class="badge active" style="font-size:0.85rem;">🟢 ACTIVE</span>'
          }
          ${data.isPaused ? '<span class="badge" style="background:rgba(100,116,139,0.2);color:var(--text2);margin-left:4px;">⏸ PAUSED</span>' : ''}
          ${isOwner ? '<div class="text-xs text-muted mt-1">You are the owner</div>' : '<div class="text-xs text-muted mt-1">You are a beneficiary/viewer</div>'}
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="card-grid card-grid-4 mb-2">
      <div class="stat-card">
        <div class="stat-icon green">💰</div>
        <div><div class="stat-val" style="font-size:1.2rem;">${parseFloat(data.balanceETH).toFixed(4)}</div><div class="stat-lbl">ETH Balance</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">👥</div>
        <div><div class="stat-val" style="font-size:1.2rem;">${data.beneficiaries.length}</div><div class="stat-lbl">Beneficiaries</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">⏱</div>
        <div><div class="stat-val" style="font-size:1rem;">${timeLeft}</div><div class="stat-lbl">Until Trigger</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon cyan">💎</div>
        <div><div class="stat-val" style="font-size:1.2rem;">${data.assets.length}</div><div class="stat-lbl">Assets Logged</div></div>
      </div>
    </div>

    <!-- Inactivity Timer -->
    <div class="card mb-2">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:600; font-size:0.9rem;">⏳ Inactivity Progress</span>
        <span class="text-sm text-muted">${timeLeft}</span>
      </div>
      <div class="progress" style="height:10px;">
        <div class="progress-fill ${data.canExecute ? '' : 'blue'}" style="width:${progressPct}%; ${data.canExecute ? 'background:var(--amber);' : ''}"></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-xs text-muted">Last ping: ${new Date(data.lastActivity * 1000).toLocaleDateString()}</span>
        <span class="text-xs text-muted">Threshold: ${Math.floor(data.inactivityThreshold / 86400)} days</span>
      </div>
    </div>

    <!-- Two Column: Beneficiaries + Assets -->
    <div class="form-row mb-2">
      <!-- Beneficiaries -->
      <div class="card">
        <h3 class="mb-2">👥 Beneficiaries</h3>
        ${data.beneficiaries.length === 0
          ? '<div class="text-sm text-muted">No beneficiaries on this contract.</div>'
          : data.beneficiaries.map(b => `
          <div style="display:flex; align-items:center; gap:10px; padding:0.6rem 0; border-bottom:1px solid var(--border);">
            <div class="bene-avatar">${(b.name || '?')[0].toUpperCase()}</div>
            <div style="flex:1;">
              <div style="font-weight:600; font-size:0.875rem;">${b.name}</div>
              <div class="font-mono text-xs text-muted">${shortAddr(b.wallet)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:700; color:var(--blue2);">${b.sharePercent}%</div>
              <div class="text-xs text-muted">${(parseFloat(data.balanceETH) * b.shareBps / 10000).toFixed(4)} ETH</div>
            </div>
          </div>`).join('')}
        ${data.beneficiaries.length > 0 ? `
          <div class="mt-2 text-xs text-muted">
            Total allocated: ${(data.beneficiaries.reduce((s,b) => s + b.shareBps, 0) / 100).toFixed(1)}%
          </div>` : ''}
      </div>

      <!-- Assets -->
      <div class="card">
        <h3 class="mb-2">💎 Assets Logged</h3>
        ${data.assets.length === 0
          ? '<div class="text-sm text-muted">No assets logged on this contract.</div>'
          : data.assets.map(a => `
          <div style="display:flex; align-items:center; gap:10px; padding:0.6rem 0; border-bottom:1px solid var(--border);">
            <div class="asset-icon" style="background:var(--bg3); width:34px; height:34px; font-size:1rem;">
              ${{ ETH:'⟠', 'ERC-20 Token':'🪙', 'ERC-721 NFT':'🖼️', USDC:'💵' }[a.assetType] || '💎'}
            </div>
            <div style="flex:1;">
              <div style="font-weight:600; font-size:0.875rem;">${a.name}</div>
              <div class="text-xs text-muted">${a.assetType}</div>
            </div>
            <div style="font-weight:700; font-size:0.875rem;">${a.amount}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card" style="border-color:rgba(59,130,246,0.25);">
      <h3 class="mb-3">⚡ Contract Actions</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:1rem;">

        ${!data.isExecuted && isOwner ? `
        <!-- PING (owner resets timer = proof of life) -->
        <div class="card" style="background:var(--bg2); border-color:rgba(16,185,129,0.2);">
          <div style="font-size:1.5rem; margin-bottom:8px;">🟢</div>
          <div style="font-weight:700; margin-bottom:4px;">Ping Contract</div>
          <div class="text-xs text-muted mb-2">Reset inactivity timer. Call this periodically to prove you're alive and prevent early execution.</div>
          <button class="btn btn-secondary" style="width:100%; border-color:rgba(16,185,129,0.3); color:var(--green);" id="action-ping">
            🟢 I'm Alive — Ping
          </button>
        </div>` : ''}

        ${!data.isExecuted ? `
        <!-- FUND CONTRACT -->
        <div class="card" style="background:var(--bg2); border-color:rgba(59,130,246,0.2);">
          <div style="font-size:1.5rem; margin-bottom:8px;">💰</div>
          <div style="font-weight:700; margin-bottom:4px;">Fund Contract</div>
          <div class="text-xs text-muted mb-2">Send ETH to the contract so it has funds to distribute to beneficiaries when executed.</div>
          <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
            <input id="fund-amount" type="number" step="0.01" min="0.001" placeholder="ETH amount" style="flex:1;" />
          </div>
          <button class="btn btn-primary" style="width:100%;" id="action-fund">
            💰 Send ETH
          </button>
        </div>` : ''}

        ${!data.isExecuted && isOwner ? `
        <!-- SELF EXECUTE (owner manually distributes) -->
        <div class="card" style="background:var(--bg2); border-color:rgba(245,158,11,0.2);">
          <div style="font-size:1.5rem; margin-bottom:8px;">📜</div>
          <div style="font-weight:700; margin-bottom:4px;">Execute Will (Owner)</div>
          <div class="text-xs text-muted mb-2">As owner, immediately distribute all ETH in the contract to beneficiaries according to their shares.</div>
          <button class="btn btn-danger" style="width:100%; background:rgba(245,158,11,0.15); color:var(--amber); border-color:rgba(245,158,11,0.3);" id="action-self-execute">
            ⚡ Execute Now
          </button>
        </div>` : ''}

        ${!data.isExecuted && data.canExecute ? `
        <!-- TRIGGER EXECUTE (anyone can call if inactivity passed) -->
        <div class="card" style="background:rgba(239,68,68,0.05); border-color:rgba(239,68,68,0.3);">
          <div style="font-size:1.5rem; margin-bottom:8px;">💀</div>
          <div style="font-weight:700; margin-bottom:4px; color:var(--red);">Trigger Execution</div>
          <div class="text-xs text-muted mb-2">Inactivity period has passed. Anyone can now trigger this will and distribute assets to beneficiaries.</div>
          <button class="btn btn-danger" style="width:100%;" id="action-trigger">
            🔴 Trigger Will Execution
          </button>
        </div>` : ''}

        ${data.isExecuted ? `
        <!-- ALREADY EXECUTED -->
        <div class="card" style="background:rgba(239,68,68,0.05); border-color:rgba(239,68,68,0.2); grid-column: 1/-1;">
          <div style="text-align:center; padding:1rem;">
            <div style="font-size:2rem; margin-bottom:8px;">✅</div>
            <div style="font-weight:700; color:var(--green);">Will Has Been Executed</div>
            <div class="text-sm text-muted mt-1">All assets have been distributed to beneficiaries. This will is now closed.</div>
          </div>
        </div>` : ''}
      </div>

      <!-- Transaction Result -->
      <div id="action-result" style="display:none;" class="card mt-2" style="background:var(--bg2);"></div>
    </div>

    <!-- Raw Contract Info -->
    <div class="card mt-2" style="background:var(--bg2);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-weight:600; font-size:0.875rem;">🔧 Raw Contract Info</span>
        <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${data.address}'); " id="copy-addr-btn">📋 Copy Address</button>
      </div>
      <div class="form-row">
        <div><div class="text-xs text-muted">Contract Address</div><div class="font-mono text-xs">${data.address}</div></div>
        <div><div class="text-xs text-muted">Owner</div><div class="font-mono text-xs">${data.owner}</div></div>
      </div>
    </div>
  `

  // Bind action buttons
  document.getElementById('action-ping')?.addEventListener('click', () => handlePing(data.address))
  document.getElementById('action-fund')?.addEventListener('click', () => handleFund(data.address))
  document.getElementById('action-self-execute')?.addEventListener('click', () => handleSelfExecute(data.address))
  document.getElementById('action-trigger')?.addEventListener('click', () => handleTrigger(data.address))
  document.getElementById('copy-addr-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(data.address)
    toast('Address copied!', 'success')
  })
}

// ── Action Handlers ────────────────────────────────────────────────────────

async function handlePing(address) {
  try {
    const txHash = await pingContract(address)
    showActionResult('success', '🟢 Ping successful!', txHash,
      'Your inactivity timer has been reset. Beneficiaries cannot execute the will until the period passes again.')
    // Reload contract data to update timer
    const data = await loadContractData(address)
    renderContractDetail(data)
  } catch (e) { /* toast already shown */ }
}

async function handleFund(address) {
  const amountInput = document.getElementById('fund-amount')
  const amount = parseFloat(amountInput?.value)
  if (!amount || amount <= 0) { toast('Enter a valid ETH amount.', 'error'); return }

  try {
    const txHash = await fundContract(address, amount)
    showActionResult('success', `💰 Funded with ${amount} ETH!`, txHash,
      'The contract now holds ETH to distribute to beneficiaries upon execution.')
    const data = await loadContractData(address)
    renderContractDetail(data)
  } catch (e) { /* toast already shown */ }
}

async function handleSelfExecute(address) {
  const confirmed = confirm(
    '⚠️ EXECUTE WILL?\n\n' +
    'This will immediately transfer ALL ETH in the contract to beneficiaries according to their share percentages.\n\n' +
    'This action is IRREVERSIBLE. Are you sure?'
  )
  if (!confirmed) return

  try {
    const txHash = await selfExecuteWill(address)
    showActionResult('success', '✅ Will Executed! Assets Distributed.', txHash,
      'All ETH has been transferred to beneficiaries. Check their wallets to confirm receipt.')
    const data = await loadContractData(address)
    renderContractDetail(data)
    import('../components/activity.js').then(m =>
      m.addActivity('💀', 'Will Executed', shortAddr(address), 'rgba(245,158,11,0.15)', 'var(--amber)'))
  } catch (e) { /* toast already shown */ }
}

async function handleTrigger(address) {
  const confirmed = confirm(
    '⚠️ TRIGGER WILL EXECUTION?\n\n' +
    'The inactivity period has passed. Triggering will distribute ALL ETH to beneficiaries.\n\n' +
    'This is IRREVERSIBLE. Continue?'
  )
  if (!confirmed) return

  try {
    const txHash = await triggerExecution(address)
    showActionResult('success', '✅ Will Triggered & Executed!', txHash,
      'All ETH has been distributed to beneficiaries according to their share percentages.')
    const data = await loadContractData(address)
    renderContractDetail(data)
    import('../components/activity.js').then(m =>
      m.addActivity('💀', 'Will Triggered', shortAddr(address), 'rgba(239,68,68,0.15)', 'var(--red)'))
  } catch (e) { /* toast already shown */ }
}

function showActionResult(type, title, txHash, description) {
  const el = document.getElementById('action-result')
  if (!el) return
  el.style.display = 'block'
  el.style.background = type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
  el.style.borderColor = type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'
  el.innerHTML = `
    <div style="font-weight:700; margin-bottom:4px;">${title}</div>
    <div class="text-sm text-muted mb-1">${description}</div>
    ${txHash ? `<div class="font-mono text-xs" style="color:var(--cyan);">TX: ${txHash}</div>` : ''}
  `
}
