// src/pages/security.js
import { state, ABI_STRING } from '../utils/state.js'
import { shortAddr, toast } from '../utils/helpers.js'

export function renderSecurity() {
  const checks = [
    { id: 'wallet',   ok: !!state.walletAddress,         okMsg: shortAddr(state.walletAddress) || 'Connected',          failMsg: 'No wallet connected' },
    { id: 'will',     ok: state.wills.length > 0,        okMsg: `${state.wills.length} will(s) created`,                failMsg: 'No wills found' },
    { id: 'bene',     ok: state.beneficiaries.length > 0, okMsg: `${state.beneficiaries.length} beneficiary/ies set`,   failMsg: 'No beneficiaries added' },
    { id: 'contract', ok: !!state.contractAddress,        okMsg: shortAddr(state.contractAddress) || 'Linked',           failMsg: 'No contract linked' }
  ]

  let score = 0
  checks.forEach(c => {
    const icon = document.getElementById('sec-' + c.id + '-icon')
    const msg  = document.getElementById('sec-' + c.id + '-msg')
    if (icon && msg) {
      icon.textContent = c.ok ? '✓' : '!'
      icon.className = 'security-check ' + (c.ok ? 'ok' : 'warn')
      msg.textContent = c.ok ? c.okMsg : c.failMsg
      if (c.ok) score++
    }
  })

  const pct = Math.round((score / 4) * 100)
  const scoreLabel = document.getElementById('sec-score-label')
  const progress   = document.getElementById('sec-progress')
  if (scoreLabel) scoreLabel.textContent = score + ' / 4'
  if (progress)   progress.style.width = pct + '%'

  const addr = document.getElementById('sec-address')
  const net  = document.getElementById('sec-network')
  const bal  = document.getElementById('sec-balance')
  const abi  = document.getElementById('contract-abi-display')

  if (addr) addr.textContent = state.walletAddress || 'Not connected'
  if (net)  net.textContent  = state.walletNetwork  || '—'
  if (bal)  bal.textContent  = state.walletBalance   || '—'
  if (abi)  abi.value        = ABI_STRING

  refreshBlockNumber()
}

async function refreshBlockNumber() {
  const el = document.getElementById('sec-block')
  if (!window.ethereum || !state.walletAddress) {
    if (el) el.textContent = '—'
    return
  }
  try {
    const bn = await window.ethereum.request({ method: 'eth_blockNumber' })
    if (el) el.textContent = '#' + parseInt(bn, 16).toLocaleString()
  } catch { if (el) el.textContent = '—' }
}

export function copyABI() {
  navigator.clipboard.writeText(ABI_STRING)
  toast('ABI copied to clipboard!', 'success')
}

export function refreshSecurityData() {
  renderSecurity()
  toast('Security data refreshed.', 'success')
}
