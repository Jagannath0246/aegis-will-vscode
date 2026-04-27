// src/components/template.js
// Returns the full HTML string injected into #app

export function getTemplate() {
  return `
  <!-- NAVBAR -->
  <nav>
    <div class="nav-brand">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      Aegis Will
    </div>
    <div class="nav-links">
      <a id="nav-dashboard">Dashboard</a>
      <a id="nav-create-will">Create Will</a>
      <a id="nav-manage-assets">Manage Assets</a>
      <a id="nav-beneficiaries">Beneficiaries</a>
      <a id="nav-security">Security</a>
      <a id="nav-support">Support</a>
      <a id="nav-contracts">My Contracts</a>
    </div>
    <button class="btn-connect" id="connect-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      Connect Wallet
    </button>
  </nav>

  <!-- DASHBOARD -->
  <div id="page-dashboard" class="page active">
    <div id="welcome-banner" class="card mb-3" style="background:linear-gradient(135deg,#1a2a50 0%,#0f1e38 100%);border-color:rgba(59,130,246,0.25);display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <div>
        <h1 style="font-size:1.8rem;">Welcome to <span style="color:var(--blue2)">Aegis Will</span></h1>
        <p class="subtitle">Manage your digital legacy securely on the blockchain.</p>
        <div style="margin-top:1rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
          <button class="btn btn-primary" id="banner-create-btn">+ Create Will</button>
          <button class="btn btn-secondary" id="banner-connect-btn">Connect Wallet</button>
        </div>
      </div>
      <div style="font-size:4rem;opacity:0.3;flex-shrink:0;">🛡️</div>
    </div>
    <div class="card-grid card-grid-4 mb-3">
      <div class="stat-card"><div class="stat-icon blue">📝</div><div><div class="stat-val" id="stat-wills">0</div><div class="stat-lbl">Total Wills</div></div></div>
      <div class="stat-card"><div class="stat-icon green">👥</div><div><div class="stat-val" id="stat-benes">0</div><div class="stat-lbl">Beneficiaries</div></div></div>
      <div class="stat-card"><div class="stat-icon amber">🪙</div><div><div class="stat-val" id="stat-assets">0</div><div class="stat-lbl">Assets Managed</div></div></div>
      <div class="stat-card"><div class="stat-icon cyan">⛓️</div><div><div class="stat-val" id="stat-network">—</div><div class="stat-lbl">Network</div></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 360px;gap:1rem;">
      <div class="card">
        <div class="section-hd"><h3>My Wills</h3><button class="btn btn-primary btn-sm" id="new-will-btn">+ New Will</button></div>
        <div id="dashboard-wills-list">
          <div class="empty-state"><div class="icon">📝</div><div style="font-weight:600;margin-bottom:4px;">No Wills Created Yet</div><div class="text-sm">Connect your wallet and create your first will</div><button class="btn btn-primary mt-2" id="dash-create-btn">Create New Will</button></div>
        </div>
      </div>
      <div class="card">
        <div class="section-hd"><h3>Recent Activity</h3></div>
        <div id="activity-list">
          <div class="empty-state" style="padding:1.5rem;"><div class="icon" style="font-size:2rem;">📋</div><div class="text-sm">No activity yet</div></div>
        </div>
      </div>
    </div>
    <div class="mt-3">
      <h3 class="mb-2">Get Started</h3>
      <div class="card-grid card-grid-4">
        <div class="card gs-card" data-action="wallet" style="cursor:pointer;"><div style="font-size:1.8rem;margin-bottom:0.75rem;">🔗</div><div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">CONNECT WALLET</div><div class="text-xs text-muted">Link MetaMask or Trust Wallet</div></div>
        <div class="card gs-card" data-action="create-will" style="cursor:pointer;"><div style="font-size:1.8rem;margin-bottom:0.75rem;">📝</div><div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">CREATE WILL</div><div class="text-xs text-muted">New secure testament</div></div>
        <div class="card gs-card" data-action="manage-assets" style="cursor:pointer;"><div style="font-size:1.8rem;margin-bottom:0.75rem;">💎</div><div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">MANAGE ASSETS</div><div class="text-xs text-muted">Allocate crypto/digital property</div></div>
        <div class="card gs-card" data-action="beneficiaries" style="cursor:pointer;"><div style="font-size:1.8rem;margin-bottom:0.75rem;">👥</div><div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">ADD BENEFICIARIES</div><div class="text-xs text-muted">Designate trusted individuals</div></div>
      </div>
    </div>
    <div class="card mt-3" style="border-color:rgba(34,211,238,0.2);">
      <div class="section-hd"><h3>🔧 Smart Contract — Remix IDE</h3><a href="https://remix.ethereum.org" target="_blank" class="btn btn-secondary btn-sm">Open Remix ↗</a></div>
      <p class="text-sm text-muted mb-2">Deploy the <strong>AegisWill.sol</strong> contract on Remix, then paste the deployed address below to connect.</p>
      <div style="display:flex;gap:0.75rem;align-items:center;">
        <input id="contract-addr-input" placeholder="Deployed contract address (0x...)" />
        <button class="btn btn-primary" id="link-contract-btn">Link Contract</button>
      </div>
      <div class="mt-2 flex items-center gap-1">
        <span class="text-xs text-muted">Linked Contract:</span>
        <code id="linked-contract" style="display:inline;padding:2px 8px;font-size:0.78rem;background:var(--bg2);border-radius:4px;color:var(--cyan);">Not linked</code>
        <button class="btn btn-ghost btn-sm" id="copy-contract-btn">📋</button>
      </div>
    </div>
  </div>

  <!-- CREATE WILL -->
  <div id="page-create-will" class="page">
    <div class="section-hd mb-3"><div><h2>Create Will</h2><p class="subtitle">Define your digital legacy in 4 steps</p></div></div>
    <div class="steps mb-3">
      <div class="step-item active" id="cw-step1-label"><div class="step-num">1</div> Basic Info</div>
      <div class="step-connector" id="cw-conn1"></div>
      <div class="step-item" id="cw-step2-label"><div class="step-num">2</div> Beneficiaries</div>
      <div class="step-connector" id="cw-conn2"></div>
      <div class="step-item" id="cw-step3-label"><div class="step-num">3</div> Assets</div>
      <div class="step-connector" id="cw-conn3"></div>
      <div class="step-item" id="cw-step4-label"><div class="step-num">4</div> Review & Deploy</div>
    </div>
    <div class="card">
      <div class="step-panel active" id="cw-step1">
        <h3 class="mb-3">Will Information</h3>
        <div class="form-row mb-2">
          <div class="form-group"><label>Will Name *</label><input id="will-name" placeholder="e.g., Primary Estate Will" /></div>
          <div class="form-group"><label>Executor Name</label><input id="will-executor" placeholder="Name of executor" /></div>
        </div>
        <div class="form-group mb-2"><label>Description</label><textarea id="will-desc" placeholder="Brief description..."></textarea></div>
        <div class="form-row mb-2">
          <div class="form-group"><label>Inactivity Trigger (days)</label><input id="will-trigger" type="number" value="365" min="30" /></div>
          <div class="form-group"><label>Will Type</label><select id="will-type"><option>Standard Will</option><option>Living Will</option><option>Trust Will</option><option>Joint Will</option></select></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1.5rem;">
          <button class="btn btn-primary" id="cw-next1">Next: Beneficiaries →</button>
        </div>
      </div>
      <div class="step-panel" id="cw-step2">
        <h3 class="mb-3">Add Beneficiaries</h3>
        <div class="form-row-3 mb-2">
          <div class="form-group"><label>Name</label><input id="cw-bene-name" placeholder="Full name" /></div>
          <div class="form-group" style="grid-column:span 2;"><label>Wallet Address</label><input id="cw-bene-addr" placeholder="0x..." /></div>
        </div>
        <div class="form-row mb-2">
          <div class="form-group"><label>Relationship</label><select id="cw-bene-rel"><option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Friend</option><option>Charity</option><option>Other</option></select></div>
          <div class="form-group"><label>Share (%)</label><input id="cw-bene-share" type="number" value="100" min="1" max="100" /></div>
        </div>
        <button class="btn btn-secondary mb-3" id="cw-add-bene-btn">+ Add Beneficiary</button>
        <div id="cw-benes-list" style="display:flex;flex-wrap:wrap;gap:0.5rem;"></div>
        <div id="share-warning" class="text-amber text-sm mt-1" style="display:none;">⚠️ Total shares exceed 100%</div>
        <div style="display:flex;justify-content:space-between;gap:0.75rem;margin-top:1.5rem;">
          <button class="btn btn-ghost" id="cw-prev2">← Back</button>
          <button class="btn btn-primary" id="cw-next2">Next: Assets →</button>
        </div>
      </div>
      <div class="step-panel" id="cw-step3">
        <h3 class="mb-3">Add Assets</h3>
        <div class="form-row mb-2">
          <div class="form-group"><label>Asset Type</label><select id="cw-asset-type"><option>ETH</option><option>ERC-20 Token</option><option>ERC-721 NFT</option><option>ERC-1155</option><option>BTC</option><option>USDC</option><option>Other</option></select></div>
          <div class="form-group"><label>Asset Name / Symbol</label><input id="cw-asset-name" placeholder="e.g., ETH, USDC" /></div>
        </div>
        <div class="form-row mb-2">
          <div class="form-group"><label>Amount / Token ID</label><input id="cw-asset-amount" placeholder="e.g., 2.5" /></div>
          <div class="form-group"><label>Contract Address (if token/NFT)</label><input id="cw-asset-contract" placeholder="0x..." /></div>
        </div>
        <button class="btn btn-secondary mb-3" id="cw-add-asset-btn">+ Add Asset</button>
        <div id="cw-assets-list"></div>
        <div style="display:flex;justify-content:space-between;gap:0.75rem;margin-top:1.5rem;">
          <button class="btn btn-ghost" id="cw-prev3">← Back</button>
          <button class="btn btn-primary" id="cw-next3">Review →</button>
        </div>
      </div>
      <div class="step-panel" id="cw-step4">
        <h3 class="mb-2">Review & Deploy</h3>
        <p class="text-sm text-muted mb-3">Review your will before deploying to the blockchain.</p>
        <div id="cw-review-content"></div>
        <div class="card mt-3" style="background:rgba(59,130,246,0.05);border-color:rgba(59,130,246,0.2);">
          <div class="flex items-center gap-2"><span style="font-size:1.3rem;">⛓️</span><div><div style="font-weight:600;font-size:0.9rem;">Blockchain Immutability</div><div class="text-xs text-muted">Once deployed, this will is verified and stored immutably on the Ethereum ledger.</div></div></div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:0.75rem;margin-top:1.5rem;">
          <button class="btn btn-ghost" id="cw-prev4">← Back</button>
          <button class="btn btn-primary" id="deploy-btn">🚀 Deploy to Blockchain</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MANAGE ASSETS -->
  <div id="page-manage-assets" class="page">
    <div class="section-hd mb-3">
      <div><h2>Manage Assets</h2><p class="subtitle">Allocate your digital property across your wills</p></div>
      <button class="btn btn-primary" id="open-add-asset-btn">+ Add Asset</button>
    </div>
    <div class="card-grid card-grid-3 mb-3">
      <div class="stat-card"><div class="stat-icon blue">💼</div><div><div class="stat-val" id="ma-total-assets">0</div><div class="stat-lbl">Total Assets</div></div></div>
      <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-val" id="ma-allocated">0%</div><div class="stat-lbl">Allocated</div></div></div>
      <div class="stat-card"><div class="stat-icon cyan">📊</div><div><div class="stat-val" id="ma-eth-balance">—</div><div class="stat-lbl">ETH Balance</div></div></div>
    </div>
    <div class="card">
      <div class="section-hd"><h3>Asset Portfolio</h3>
        <select id="asset-filter" style="width:auto;font-size:0.82rem;padding:0.4rem 0.75rem;">
          <option value="">All Types</option><option value="ETH">ETH</option><option value="ERC-20">ERC-20</option><option value="NFT">NFT</option>
        </select>
      </div>
      <div id="assets-list">
        <div class="empty-state"><div class="icon">💎</div><div style="font-weight:600;margin-bottom:4px;">No Assets Added</div><div class="text-sm">Add your crypto assets to include them in your will</div><button class="btn btn-primary mt-2" id="add-asset-empty-btn">Add First Asset</button></div>
      </div>
    </div>
  </div>

  <!-- BENEFICIARIES -->
  <div id="page-beneficiaries" class="page">
    <div class="section-hd mb-3">
      <div><h2>Beneficiaries</h2><p class="subtitle">Manage the people who will inherit your digital assets</p></div>
      <button class="btn btn-primary" id="open-add-bene-btn">+ Add Beneficiary</button>
    </div>
    <div class="card-grid card-grid-3 mb-3">
      <div class="stat-card"><div class="stat-icon blue">👤</div><div><div class="stat-val" id="bene-count">0</div><div class="stat-lbl">Total Beneficiaries</div></div></div>
      <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-val" id="bene-verified">0</div><div class="stat-lbl">Verified</div></div></div>
      <div class="stat-card"><div class="stat-icon amber">⏳</div><div><div class="stat-val" id="bene-pending">0</div><div class="stat-lbl">Pending</div></div></div>
    </div>
    <div class="card"><div id="benes-table-container">
      <div class="empty-state"><div class="icon">👥</div><div style="font-weight:600;margin-bottom:4px;">No Beneficiaries Added</div><div class="text-sm">Add trusted individuals</div><button class="btn btn-primary mt-2" id="add-bene-empty-btn">Add Beneficiary</button></div>
    </div></div>
  </div>

  <!-- SECURITY -->
  <div id="page-security" class="page">
    <div class="section-hd mb-3"><div><h2>Security</h2><p class="subtitle">Your account security and on-chain verification status</p></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div class="card">
        <h3 class="mb-3">Security Checklist</h3>
        <div class="security-item"><div class="security-check warn" id="sec-wallet-icon">!</div><div><div style="font-weight:600;font-size:0.9rem;">Wallet Connected</div><div class="text-xs text-muted" id="sec-wallet-msg">No wallet connected</div></div><button class="btn btn-secondary btn-sm" id="sec-connect-btn" style="margin-left:auto;">Connect</button></div>
        <div class="security-item"><div class="security-check warn" id="sec-will-icon">!</div><div><div style="font-weight:600;font-size:0.9rem;">Will Created</div><div class="text-xs text-muted" id="sec-will-msg">No wills found</div></div></div>
        <div class="security-item"><div class="security-check warn" id="sec-bene-icon">!</div><div><div style="font-weight:600;font-size:0.9rem;">Beneficiaries Set</div><div class="text-xs text-muted" id="sec-bene-msg">No beneficiaries added</div></div></div>
        <div class="security-item"><div class="security-check warn" id="sec-contract-icon">!</div><div><div style="font-weight:600;font-size:0.9rem;">Contract Linked</div><div class="text-xs text-muted" id="sec-contract-msg">No contract linked</div></div></div>
        <div class="mt-3">
          <div class="flex items-center justify-between mb-1"><span class="text-sm">Security Score</span><span class="text-sm text-accent" id="sec-score-label">0 / 4</span></div>
          <div class="progress"><div class="progress-fill blue" id="sec-progress" style="width:0%"></div></div>
        </div>
      </div>
      <div class="card">
        <h3 class="mb-3">Blockchain Verification</h3>
        <div class="card mb-2" style="background:var(--bg2);"><div class="text-xs text-muted mb-1">Connected Address</div><div class="font-mono text-sm" id="sec-address">Not connected</div></div>
        <div class="card mb-2" style="background:var(--bg2);"><div class="text-xs text-muted mb-1">Network</div><div id="sec-network" class="text-sm">—</div></div>
        <div class="card mb-2" style="background:var(--bg2);"><div class="text-xs text-muted mb-1">Block Number</div><div id="sec-block" class="text-sm text-cyan">—</div></div>
        <div class="card" style="background:var(--bg2);"><div class="text-xs text-muted mb-1">Wallet Balance</div><div id="sec-balance" class="text-sm text-green">—</div></div>
        <div class="mt-3"><button class="btn btn-secondary" style="width:100%;" id="refresh-sec-btn">🔄 Refresh Data</button></div>
      </div>
      <div class="card" style="grid-column:span 2;">
        <h3 class="mb-3">Smart Contract ABI</h3>
        <p class="text-sm text-muted mb-2">Use this ABI when interacting with your deployed AegisWill contract in Remix IDE.</p>
        <textarea id="contract-abi-display" style="min-height:160px;font-family:monospace;font-size:0.75rem;color:var(--cyan);" readonly></textarea>
        <div class="flex gap-1 mt-2">
          <button class="btn btn-secondary btn-sm" id="copy-abi-btn">📋 Copy ABI</button>
          <a href="https://remix.ethereum.org" target="_blank" class="btn btn-primary btn-sm">🔧 Open Remix IDE</a>
        </div>
      </div>
    </div>
  </div>

  <!-- SUPPORT -->
  <div id="page-support" class="page">
    <div class="section-hd mb-3"><div><h2>Support</h2><p class="subtitle">How-to guides and FAQs</p></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div class="card">
        <h3 class="mb-3">📚 Getting Started</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <div class="card faq-item" style="background:var(--bg2);cursor:pointer;"><div class="flex items-center justify-between"><span style="font-weight:600;font-size:0.875rem;">How do I connect my MetaMask wallet?</span><span>▼</span></div><div class="faq-body text-sm text-muted mt-1">Click "Connect Wallet" in the top-right corner. Select MetaMask. Make sure MetaMask is installed as a browser extension and unlocked. Approve the connection request in MetaMask.</div></div>
          <div class="card faq-item" style="background:var(--bg2);cursor:pointer;"><div class="flex items-center justify-between"><span style="font-weight:600;font-size:0.875rem;">How do I deploy with Remix IDE?</span><span>▼</span></div><div class="faq-body text-sm text-muted mt-1">1. Open remix.ethereum.org. 2. Create AegisWill.sol and paste the contract code. 3. Compile with Solidity 0.8.20. 4. Select "Injected Provider - MetaMask". 5. Pass constructor args (name, inactivityDays). 6. Deploy and copy the address. 7. Paste in Dashboard → Link Contract.</div></div>
          <div class="card faq-item" style="background:var(--bg2);cursor:pointer;"><div class="flex items-center justify-between"><span style="font-weight:600;font-size:0.875rem;">What happens if I lose my wallet?</span><span>▼</span></div><div class="faq-body text-sm text-muted mt-1">Always back up your 12-24 word seed phrase securely offline. The will contract is deployed on-chain and tied to your wallet address. Recovery requires access to your seed phrase.</div></div>
          <div class="card faq-item" style="background:var(--bg2);cursor:pointer;"><div class="flex items-center justify-between"><span style="font-weight:600;font-size:0.875rem;">How are beneficiaries verified?</span><span>▼</span></div><div class="faq-body text-sm text-muted mt-1">Beneficiaries are identified by their Ethereum wallet address. When the will is executed, the smart contract automatically transfers assets to these addresses. No third-party verification is needed.</div></div>
        </div>
      </div>
      <div class="card">
        <h3 class="mb-3">📬 Contact Support</h3>
        <div class="form-group mb-2"><label>Subject</label><select><option>General Inquiry</option><option>Technical Issue</option><option>Wallet Connection</option><option>Smart Contract Issue</option></select></div>
        <div class="form-group mb-2"><label>Your Wallet Address (optional)</label><input id="support-wallet" placeholder="0x..." /></div>
        <div class="form-group mb-2"><label>Message</label><textarea placeholder="Describe your issue..."></textarea></div>
        <button class="btn btn-primary" style="width:100%;" id="submit-support-btn">Send Message</button>
        <div class="divider"></div>
        <h3 class="mb-2">🔗 Resources</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <a href="https://remix.ethereum.org" target="_blank" class="btn btn-secondary" style="justify-content:flex-start;">🔧 Remix IDE</a>
          <a href="https://metamask.io" target="_blank" class="btn btn-secondary" style="justify-content:flex-start;">🦊 MetaMask</a>
          <a href="https://etherscan.io" target="_blank" class="btn btn-secondary" style="justify-content:flex-start;">🔍 Etherscan</a>
          <a href="https://docs.soliditylang.org" target="_blank" class="btn btn-secondary" style="justify-content:flex-start;">📖 Solidity Docs</a>
        </div>
      </div>
    </div>
  </div>

  <!-- CONTRACTS PAGE -->
  <div id="page-contracts" class="page">
    <!-- Rendered dynamically by contracts.js -->
    <div class="empty-state">
      <div class="icon">📄</div>
      <div style="font-weight:600;">Loading contracts...</div>
    </div>
  </div>

  <!-- MODALS -->
  <div class="modal-overlay" id="wallet-modal">
    <div class="modal">
      <div class="modal-hd"><h3>Connect Wallet</h3><button class="modal-close" id="close-wallet-modal">✕</button></div>
      <p class="text-sm text-muted mb-3">Securely link your cryptocurrency wallet. Your identity remains private and secure.</p>
      <div class="wallet-option" id="mm-option"><div style="font-size:2rem;">🦊</div><div><div class="wallet-option-name">MetaMask</div><div class="wallet-option-desc">Most popular browser wallet</div></div><span style="margin-left:auto;font-size:0.8rem;" id="mm-status">→</span></div>
      <div class="wallet-option" id="wc-option"><div style="font-size:2rem;">🔗</div><div><div class="wallet-option-name">WalletConnect</div><div class="wallet-option-desc">Connect via QR code</div></div><span style="margin-left:auto;font-size:0.8rem;">→</span></div>
      <div class="wallet-option" id="tw-option"><div style="font-size:2rem;">🛡️</div><div><div class="wallet-option-name">Trust Wallet</div><div class="wallet-option-desc">Mobile-first wallet</div></div><span style="margin-left:auto;font-size:0.8rem;">→</span></div>
      <p class="text-xs text-muted mt-2" style="text-align:center;">We never store private keys.</p>
    </div>
  </div>

  <div class="modal-overlay" id="add-asset-modal">
    <div class="modal">
      <div class="modal-hd"><h3>Add Asset</h3><button class="modal-close" id="close-asset-modal">✕</button></div>
      <div class="form-group mb-2"><label>Asset Type</label><select id="ma-asset-type"><option>ETH</option><option>ERC-20 Token</option><option>ERC-721 NFT</option><option>USDC</option><option>Other</option></select></div>
      <div class="form-row mb-2">
        <div class="form-group"><label>Asset Name</label><input id="ma-asset-name" placeholder="e.g., ETH, USDC" /></div>
        <div class="form-group"><label>Amount</label><input id="ma-asset-amount" placeholder="e.g., 2.5" type="number" step="any" /></div>
      </div>
      <div class="form-group mb-2"><label>Contract Address (for tokens/NFTs)</label><input id="ma-asset-contract" placeholder="0x..." /></div>
      <div class="form-group mb-3"><label>Assign to Will</label><select id="ma-asset-will"><option value="">— Unassigned —</option></select></div>
      <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
        <button class="btn btn-ghost" id="cancel-asset-btn">Cancel</button>
        <button class="btn btn-primary" id="save-asset-btn">Add Asset</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="add-bene-modal">
    <div class="modal">
      <div class="modal-hd"><h3>Add Beneficiary</h3><button class="modal-close" id="close-bene-modal">✕</button></div>
      <div class="form-row mb-2">
        <div class="form-group"><label>Full Name *</label><input id="ab-name" placeholder="e.g., Alice Smith" /></div>
        <div class="form-group"><label>Email (optional)</label><input id="ab-email" type="email" placeholder="alice@example.com" /></div>
      </div>
      <div class="form-group mb-2"><label>Wallet Address *</label><input id="ab-address" placeholder="0x..." /></div>
      <div class="form-row mb-2">
        <div class="form-group"><label>Relationship</label><select id="ab-rel"><option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Friend</option><option>Charity</option><option>Other</option></select></div>
        <div class="form-group"><label>Share (%)</label><input id="ab-share" type="number" value="100" min="1" max="100" /></div>
      </div>
      <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
        <button class="btn btn-ghost" id="cancel-bene-btn">Cancel</button>
        <button class="btn btn-primary" id="save-bene-btn">Add Beneficiary</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="will-detail-modal">
    <div class="modal">
      <div class="modal-hd"><h3 id="wdm-title">Will Details</h3><button class="modal-close" id="close-will-modal">✕</button></div>
      <div id="wdm-content"></div>
      <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:1.5rem;">
        <button class="btn btn-danger btn-sm" id="wdm-delete">🗑 Delete Will</button>
        <button class="btn btn-ghost" id="close-will-btn">Close</button>
      </div>
    </div>
  </div>

  <div id="toast-container"></div>
  `
}
