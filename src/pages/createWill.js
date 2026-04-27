// src/pages/createWill.js
import { state } from '../utils/state.js'
import { toast, shortAddr, ASSET_ICONS } from '../utils/helpers.js'
import { openModal } from '../utils/helpers.js'

let currentStep = 1
export const cwDraftBenes = []
export const cwDraftAssets = []

export function cwShowStep(n) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById('cw-step' + i).classList.toggle('active', i === n)
    const l = document.getElementById('cw-step' + i + '-label')
    l.className = 'step-item' + (i === n ? ' active' : i < n ? ' done' : '')
    if (i < 4) {
      document.getElementById('cw-conn' + i).className = 'step-connector' + (i < n ? ' done' : '')
    }
  }
  currentStep = n
}

export function cwNext(from) {
  if (from === 1) {
    const name = document.getElementById('will-name').value.trim()
    if (!name) { toast('Please enter a will name.', 'error'); return }
    state.currentWillDraft.name     = name
    state.currentWillDraft.executor = document.getElementById('will-executor').value.trim()
    state.currentWillDraft.desc     = document.getElementById('will-desc').value.trim()
    state.currentWillDraft.trigger  = parseInt(document.getElementById('will-trigger').value) || 365
    state.currentWillDraft.type     = document.getElementById('will-type').value
    cwShowStep(2)
  } else if (from === 2) {
    cwShowStep(3)
  } else if (from === 3) {
    buildReview()
    cwShowStep(4)
  }
}

export function cwPrev(from) {
  if (from > 1) cwShowStep(from - 1)
}

export function cwAddBene() {
  const name  = document.getElementById('cw-bene-name').value.trim()
  const addr  = document.getElementById('cw-bene-addr').value.trim()
  const rel   = document.getElementById('cw-bene-rel').value
  const share = parseInt(document.getElementById('cw-bene-share').value) || 0
  if (!name || !addr) { toast('Enter beneficiary name and address.', 'error'); return }
  if (!addr.startsWith('0x') || addr.length < 40) { toast('Invalid wallet address.', 'error'); return }
  cwDraftBenes.push({ name, addr, rel, share })
  state.currentWillDraft.beneficiaries = [...cwDraftBenes]
  renderCWBenes()
  document.getElementById('cw-bene-name').value = ''
  document.getElementById('cw-bene-addr').value = ''
  document.getElementById('cw-bene-share').value = ''
  toast('Beneficiary added!', 'success')
}

export function cwRemoveBene(i) {
  cwDraftBenes.splice(i, 1)
  renderCWBenes()
}

function renderCWBenes() {
  const list = document.getElementById('cw-benes-list')
  list.innerHTML = cwDraftBenes.map((b, i) => `
    <div class="bene-tag">
      <div class="bene-avatar">${b.name[0].toUpperCase()}</div>
      <div>
        <div style="font-weight:600;">${b.name}</div>
        <div style="font-size:0.7rem; color:var(--text3);">${shortAddr(b.addr)} · ${b.share}%</div>
      </div>
      <button class="bene-remove" data-idx="${i}">✕</button>
    </div>`).join('')
  list.querySelectorAll('.bene-remove').forEach(btn => {
    btn.addEventListener('click', () => cwRemoveBene(parseInt(btn.dataset.idx)))
  })
  const total = cwDraftBenes.reduce((s, b) => s + b.share, 0)
  document.getElementById('share-warning').style.display = total > 100 ? 'block' : 'none'
}

export function cwAddAsset() {
  const type     = document.getElementById('cw-asset-type').value
  const name     = document.getElementById('cw-asset-name').value.trim()
  const amount   = document.getElementById('cw-asset-amount').value.trim()
  const contract = document.getElementById('cw-asset-contract').value.trim()
  if (!name || !amount) { toast('Enter asset name and amount.', 'error'); return }
  cwDraftAssets.push({ type, name, amount, contract })
  state.currentWillDraft.assets = [...cwDraftAssets]
  renderCWAssets()
  document.getElementById('cw-asset-name').value = ''
  document.getElementById('cw-asset-amount').value = ''
  document.getElementById('cw-asset-contract').value = ''
  toast('Asset added!', 'success')
}

export function cwRemoveAsset(i) {
  cwDraftAssets.splice(i, 1)
  renderCWAssets()
}

function renderCWAssets() {
  const list = document.getElementById('cw-assets-list')
  list.innerHTML = cwDraftAssets.map((a, i) => `
    <div class="asset-row">
      <div class="asset-icon" style="background:var(--bg3);">${ASSET_ICONS[a.type] || '💎'}</div>
      <div class="asset-info">
        <div class="asset-name">${a.name} <span class="badge draft">${a.type}</span></div>
        ${a.contract ? `<div class="asset-addr">${shortAddr(a.contract)}</div>` : ''}
      </div>
      <div class="asset-val"><div class="asset-amount">${a.amount}</div></div>
      <button class="btn btn-ghost btn-sm" data-idx="${i}">✕</button>
    </div>`).join('')
  list.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => cwRemoveAsset(parseInt(btn.dataset.idx)))
  })
}

function buildReview() {
  const d = state.currentWillDraft
  document.getElementById('cw-review-content').innerHTML = `
    <div class="card mb-2" style="background:var(--bg2);">
      <div class="form-row">
        <div><div class="text-xs text-muted">Will Name</div><div style="font-weight:700;">${d.name || '—'}</div></div>
        <div><div class="text-xs text-muted">Type</div><div>${d.type}</div></div>
      </div>
      <div class="form-row mt-1">
        <div><div class="text-xs text-muted">Executor</div><div>${d.executor || '—'}</div></div>
        <div><div class="text-xs text-muted">Inactivity Trigger</div><div>${d.trigger} days</div></div>
      </div>
      ${d.desc ? `<div class="mt-1"><div class="text-xs text-muted">Description</div><div class="text-sm">${d.desc}</div></div>` : ''}
    </div>
    <div class="form-row">
      <div class="card" style="background:var(--bg2);">
        <div class="text-xs text-muted mb-1">Beneficiaries (${cwDraftBenes.length})</div>
        ${cwDraftBenes.length ? cwDraftBenes.map(b => `<div class="text-sm">${b.name} — ${b.share}%</div>`).join('') : '<div class="text-sm text-muted">None added</div>'}
      </div>
      <div class="card" style="background:var(--bg2);">
        <div class="text-xs text-muted mb-1">Assets (${cwDraftAssets.length})</div>
        ${cwDraftAssets.length ? cwDraftAssets.map(a => `<div class="text-sm">${a.name}: ${a.amount}</div>`).join('') : '<div class="text-sm text-muted">None added</div>'}
      </div>
    </div>`
}

export async function deployWill() {
  if (!state.walletAddress) {
    toast('Please connect your wallet first.', 'error')
    openModal('wallet-modal')
    return
  }
  const d = state.currentWillDraft
  if (!d.name) { toast('Please fill in will information.', 'error'); return }

  const btn = document.getElementById('deploy-btn')
  btn.textContent = '⏳ Waiting for MetaMask...'
  btn.disabled = true

  try {
    // ── Real on-chain transactions via ethers.js ──────────────────
    const { BrowserProvider, Contract, parseEther } = await import('ethers')

    // Pass 'any' network to prevent ethers from doing ENS lookup
    // which fails on Hardhat localhost (no ENS support)
    const provider = new BrowserProvider(window.ethereum, 'any')

    // Get the current account address directly from MetaMask
    // instead of letting ethers resolve it (avoids ENS error)
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    const signerAddress = accounts[0]
    const signer = await provider.getSigner(signerAddress)

    let txHash = null
    let contractUsed = false

    // If a contract is linked, call addBeneficiary + addAsset on-chain
    if (state.contractAddress) {
      const ABI = [
        'function addBeneficiary(address payable _wallet, string calldata _name, uint256 _shareBps) external',
        'function addAsset(string calldata _type, string calldata _name, address _contractAddr, uint256 _amount) external',
        'function setExecutor(string calldata _executor) external',
        'function ping() external'
      ]
      const contract = new Contract(state.contractAddress, ABI, signer)

      // Set executor if provided
      if (d.executor) {
        btn.textContent = '⏳ Setting executor...'
        const tx0 = await contract.setExecutor(d.executor)
        await tx0.wait()
        txHash = tx0.hash
      }

      // Add beneficiaries on-chain
      for (const b of cwDraftBenes) {
        btn.textContent = `⏳ Adding ${b.name}...`
        const shareBps = Math.round(b.share * 100) // convert % to basis points
        const tx = await contract.addBeneficiary(b.addr, b.name, shareBps)
        await tx.wait()
        txHash = txHash || tx.hash
        toast(`Beneficiary ${b.name} added on-chain ✅`, 'success')
      }

      // Add assets on-chain
      for (const a of cwDraftAssets) {
        btn.textContent = `⏳ Adding asset ${a.name}...`
        const contractAddr = a.contract || '0x0000000000000000000000000000000000000000'
        const amountWei = a.type === 'ETH'
          ? parseEther(String(a.amount || '0'))
          : BigInt(Math.round(parseFloat(a.amount || '0') * 1e6)) // token units
        const tx = await contract.addAsset(a.type, a.name, contractAddr, amountWei)
        await tx.wait()
        txHash = txHash || tx.hash
        toast(`Asset ${a.name} added on-chain ✅`, 'success')
      }

      // Ping to reset inactivity timer
      btn.textContent = '⏳ Finalizing on-chain...'
      const pingTx = await contract.ping()
      await pingTx.wait()
      txHash = txHash || pingTx.hash
      contractUsed = true

    } else {
      // No contract linked — do a minimal ETH self-transfer to get a real tx hash
      btn.textContent = '⏳ Recording on-chain...'
      toast('No contract linked — recording a proof transaction.', 'info')
      // Encode will name as hex data for the proof tx (no Buffer in browser)
      const encoder = new TextEncoder()
      const bytes = encoder.encode('AegisWill:' + d.name + ':' + Date.now())
      const hexData = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('')
      const tx = await signer.sendTransaction({
        to: signerAddress,
        value: 0n,
        data: hexData
      })
      await tx.wait()
      txHash = tx.hash
    }

    // ── Save will to local state ──────────────────────────────────
    const will = {
      id: Date.now(),
      name: d.name,
      executor: d.executor,
      desc: d.desc,
      trigger: d.trigger,
      type: d.type,
      beneficiaries: [...cwDraftBenes],
      assets: [...cwDraftAssets],
      status: 'active',
      onChain: contractUsed,
      contractAddress: state.contractAddress || null,
      createdAt: new Date().toLocaleDateString(),
      txHash: txHash
    }

    state.wills.push(will)
    cwDraftBenes.forEach(b => {
      if (!state.beneficiaries.find(x => x.address === b.addr))
        state.beneficiaries.push({ name: b.name, address: b.addr, rel: b.rel, share: b.share, willId: will.id })
    })
    cwDraftAssets.forEach(a => {
      state.assets.push({ ...a, willId: will.id, id: Date.now() + Math.random() })
    })

    btn.textContent = '🚀 Deploy to Blockchain'
    btn.disabled = false

    import('../utils/stats.js').then(m => m.updateStats())
    import('./dashboard.js').then(m => m.renderDashboardWills())
    import('../components/activity.js').then(m =>
      m.addActivity('📝', 'Will Deployed On-Chain', will.name, 'rgba(16,185,129,0.15)', 'var(--green)'))

    toast(`✅ Will "${will.name}" deployed! TX: ${txHash.slice(0,10)}...`, 'success')

  } catch (err) {
    btn.textContent = '🚀 Deploy to Blockchain'
    btn.disabled = false
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      toast('Transaction rejected by user.', 'error')
    } else {
      toast('Error: ' + (err.shortMessage || err.message || 'Unknown error'), 'error')
      console.error('Deploy error:', err)
    }
    return
  }

  // ── Reset wizard ──────────────────────────────────────────────
  state.currentWillDraft = { name: '', executor: '', desc: '', trigger: 365, type: 'Standard Will', beneficiaries: [], assets: [] }
  cwDraftBenes.length = 0
  cwDraftAssets.length = 0
  document.getElementById('will-name').value = ''
  document.getElementById('will-executor').value = ''
  document.getElementById('will-desc').value = ''
  cwShowStep(1)
  import('../main.js').then(m => m.nav('dashboard'))
}
