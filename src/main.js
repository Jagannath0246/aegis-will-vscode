// src/main.js  — Application entry point
import './styles/main.css'
import { getTemplate } from './components/template.js'
import { openModal, closeModal, toast } from './utils/helpers.js'
import { connectMetaMask, updateNavWallet } from './hooks/useWallet.js'
import { updateStats } from './utils/stats.js'
import { renderDashboardWills, setContractAddress, copyContract } from './pages/dashboard.js'
import { cwNext, cwPrev, cwAddBene, cwAddAsset, deployWill, cwShowStep } from './pages/createWill.js'
import { renderAssetsPage, saveAsset, refreshWillSelectOptions } from './pages/manageAssets.js'
import { renderBeneficiariesPage, saveBene } from './pages/beneficiaries.js'
import { renderSecurity, copyABI, refreshSecurityData } from './pages/security.js'
import { renderContractsPage } from './pages/contracts.js'

// ── Inject HTML ──────────────────────────────────────────
document.getElementById('app').innerHTML = getTemplate()

// ── Navigation ───────────────────────────────────────────
export function nav(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'))
  document.getElementById('page-' + page)?.classList.add('active')
  document.getElementById('nav-' + page)?.classList.add('active')

  if (page === 'security')       renderSecurity()
  if (page === 'manage-assets')  renderAssetsPage()
  if (page === 'beneficiaries')  renderBeneficiariesPage()
  if (page === 'contracts')      renderContractsPage()
}

// ── Modal helpers ─────────────────────────────────────────
export function openAddAssetModal() {
  refreshWillSelectOptions('ma-asset-will')
  openModal('add-asset-modal')
}
export function openAddBeneModal() { openModal('add-bene-modal') }

// ── Wire up all event listeners ───────────────────────────
function bindEvents() {

  // Nav links
  document.getElementById('nav-dashboard')    ?.addEventListener('click', () => nav('dashboard'))
  document.getElementById('nav-create-will')  ?.addEventListener('click', () => nav('create-will'))
  document.getElementById('nav-manage-assets')?.addEventListener('click', () => nav('manage-assets'))
  document.getElementById('nav-beneficiaries')?.addEventListener('click', () => nav('beneficiaries'))
  document.getElementById('nav-security')     ?.addEventListener('click', () => nav('security'))
  document.getElementById('nav-support')      ?.addEventListener('click', () => nav('support'))
  document.getElementById('nav-contracts')    ?.addEventListener('click', () => nav('contracts'))

  // Connect wallet button
  document.getElementById('connect-btn')?.addEventListener('click', () => openModal('wallet-modal'))

  // Wallet modal
  document.getElementById('mm-option')         ?.addEventListener('click', connectMetaMask)
  document.getElementById('wc-option')         ?.addEventListener('click', () => toast('WalletConnect coming soon. Use MetaMask.', 'info'))
  document.getElementById('tw-option')         ?.addEventListener('click', () => toast('Trust Wallet: use MetaMask for now.', 'info'))
  document.getElementById('close-wallet-modal')?.addEventListener('click', () => closeModal('wallet-modal'))

  // Overlay clicks close modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open') })
  })

  // Dashboard
  document.getElementById('banner-create-btn') ?.addEventListener('click', () => nav('create-will'))
  document.getElementById('banner-connect-btn')?.addEventListener('click', () => openModal('wallet-modal'))
  document.getElementById('new-will-btn')       ?.addEventListener('click', () => nav('create-will'))
  document.getElementById('dash-create-btn')    ?.addEventListener('click', () => nav('create-will'))
  document.getElementById('link-contract-btn')  ?.addEventListener('click', setContractAddress)
  document.getElementById('copy-contract-btn')  ?.addEventListener('click', copyContract)

  // Get Started cards
  document.querySelectorAll('.gs-card').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action
      if (action === 'wallet') openModal('wallet-modal')
      else nav(action)
    })
  })

  // Create Will wizard
  document.getElementById('cw-next1')       ?.addEventListener('click', () => cwNext(1))
  document.getElementById('cw-next2')       ?.addEventListener('click', () => cwNext(2))
  document.getElementById('cw-next3')       ?.addEventListener('click', () => cwNext(3))
  document.getElementById('cw-prev2')       ?.addEventListener('click', () => cwPrev(2))
  document.getElementById('cw-prev3')       ?.addEventListener('click', () => cwPrev(3))
  document.getElementById('cw-prev4')       ?.addEventListener('click', () => cwPrev(4))
  document.getElementById('cw-add-bene-btn')?.addEventListener('click', cwAddBene)
  document.getElementById('cw-add-asset-btn')?.addEventListener('click', cwAddAsset)
  document.getElementById('deploy-btn')      ?.addEventListener('click', deployWill)

  // Manage Assets
  document.getElementById('open-add-asset-btn')  ?.addEventListener('click', openAddAssetModal)
  document.getElementById('add-asset-empty-btn') ?.addEventListener('click', openAddAssetModal)
  document.getElementById('asset-filter')        ?.addEventListener('change', e => renderAssetsPage(e.target.value))
  document.getElementById('close-asset-modal')   ?.addEventListener('click', () => closeModal('add-asset-modal'))
  document.getElementById('cancel-asset-btn')    ?.addEventListener('click', () => closeModal('add-asset-modal'))
  document.getElementById('save-asset-btn')      ?.addEventListener('click', saveAsset)

  // Beneficiaries
  document.getElementById('open-add-bene-btn')  ?.addEventListener('click', openAddBeneModal)
  document.getElementById('add-bene-empty-btn') ?.addEventListener('click', openAddBeneModal)
  document.getElementById('close-bene-modal')   ?.addEventListener('click', () => closeModal('add-bene-modal'))
  document.getElementById('cancel-bene-btn')    ?.addEventListener('click', () => closeModal('add-bene-modal'))
  document.getElementById('save-bene-btn')      ?.addEventListener('click', saveBene)

  // Security
  document.getElementById('sec-connect-btn')  ?.addEventListener('click', () => openModal('wallet-modal'))
  document.getElementById('refresh-sec-btn')  ?.addEventListener('click', refreshSecurityData)
  document.getElementById('copy-abi-btn')     ?.addEventListener('click', copyABI)

  // Will detail modal
  document.getElementById('close-will-modal')?.addEventListener('click', () => closeModal('will-detail-modal'))
  document.getElementById('close-will-btn')  ?.addEventListener('click', () => closeModal('will-detail-modal'))

  // Support
  document.getElementById('submit-support-btn')?.addEventListener('click', () =>
    toast('Message sent! Our team will get back to you shortly.', 'success'))

  // FAQ
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const body = item.querySelector('.faq-body')
      body.style.display = body.style.display === 'block' ? 'none' : 'block'
    })
  })
}

// ── Boot ─────────────────────────────────────────────────
bindEvents()
updateNavWallet()
updateStats()
renderSecurity()
nav('dashboard')

console.log('%c🛡️ Aegis Will DApp loaded', 'color:#60a5fa; font-size:14px; font-weight:bold;')
