// src/utils/helpers.js

export function shortAddr(addr) {
  return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''
}

export function getNetworkName(chainId) {
  const map = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon',
    '0x38': 'BSC',
    '0xa86a': 'Avalanche',
    '0xa': 'Optimism',
    '0xa4b1': 'Arbitrum'
  }
  return map[chainId] || `Chain ${chainId}`
}

export function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container')
  const el = document.createElement('div')
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  el.className = `toast ${type}`
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`
  container.appendChild(el)
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s'
    setTimeout(() => el.remove(), 300)
  }, 3500)
}

export function openModal(id) {
  document.getElementById(id).classList.add('open')
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('open')
}

export const ASSET_ICONS = {
  ETH: '⟠', 'ERC-20 Token': '🪙', 'ERC-721 NFT': '🖼️',
  USDC: '💵', Other: '💎', BTC: '₿', 'ERC-1155': '🎴'
}
