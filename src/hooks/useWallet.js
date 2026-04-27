// src/hooks/useWallet.js
import { state } from '../utils/state.js'
import { shortAddr, getNetworkName, toast, openModal } from '../utils/helpers.js'

export async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    toast('MetaMask not detected. Please install the MetaMask extension.', 'error')
    window.open('https://metamask.io/download/', '_blank')
    return
  }
  try {
    document.getElementById('mm-status').textContent = '⏳ Connecting...'
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const chainId  = await window.ethereum.request({ method: 'eth_chainId' })
    const balHex   = await window.ethereum.request({ method: 'eth_getBalance', params: [accounts[0], 'latest'] })

    state.walletAddress = accounts[0]
    state.walletNetwork = getNetworkName(chainId)
    state.walletBalance = (parseInt(balHex, 16) / 1e18).toFixed(4) + ' ETH'

    onWalletConnected()
    document.getElementById('mm-status').textContent = '✅'

    // Import here to avoid circular dep
    const { closeModal } = await import('../utils/helpers.js')
    closeModal('wallet-modal')
    toast('Wallet connected: ' + shortAddr(accounts[0]), 'success')

    window.ethereum.on('accountsChanged', async (accs) => {
      if (accs.length === 0) {
        disconnectWallet()
      } else {
        const balHex2 = await window.ethereum.request({ method: 'eth_getBalance', params: [accs[0], 'latest'] })
        state.walletAddress = accs[0]
        state.walletBalance = (parseInt(balHex2, 16) / 1e18).toFixed(4) + ' ETH'
        onWalletConnected()
        toast('Account changed: ' + shortAddr(accs[0]), 'info')
      }
    })

    window.ethereum.on('chainChanged', (chain) => {
      state.walletNetwork = getNetworkName(chain)
      updateNavWallet()
      import('../pages/security.js').then(m => m.renderSecurity())
      import('../utils/stats.js').then(m => m.updateStats())
    })
  } catch (e) {
    document.getElementById('mm-status').textContent = '✕'
    if (e.code === 4001) toast('Connection rejected by user.', 'error')
    else toast('Error: ' + e.message, 'error')
  }
}

function onWalletConnected() {
  updateNavWallet()
  import('../utils/stats.js').then(m => m.updateStats())
  updateWelcomeBanner()
  import('../pages/security.js').then(m => m.renderSecurity())
}

export function disconnectWallet() {
  state.walletAddress = null
  state.walletNetwork = null
  state.walletBalance = null
  updateNavWallet()
  import('../utils/stats.js').then(m => m.updateStats())
  import('../pages/security.js').then(m => m.renderSecurity())
  toast('Wallet disconnected.', 'info')
}

export function updateNavWallet() {
  const btn = document.getElementById('connect-btn')
  if (state.walletAddress) {
    btn.innerHTML = `<div class="wallet-dot"></div> ${shortAddr(state.walletAddress)}`
    btn.classList.add('connected')
    btn.onclick = showWalletInfo
  } else {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Connect Wallet`
    btn.classList.remove('connected')
    btn.onclick = () => openModal('wallet-modal')
  }
}

function showWalletInfo() {
  toast(`${state.walletAddress} | ${state.walletNetwork} | ${state.walletBalance}`, 'info')
}

function updateWelcomeBanner() {
  const p = document.querySelector('#welcome-banner p')
  if (p && state.walletAddress)
    p.textContent = `Connected: ${shortAddr(state.walletAddress)} on ${state.walletNetwork}`
}
