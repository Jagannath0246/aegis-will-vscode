// src/utils/contractManager.js
// Handles: loading deployed contracts from chain + will execution (asset transfer)

import { state } from './state.js'
import { toast } from './helpers.js'

// ── Full ABI for all contract interactions ──────────────────────────────────
export const FULL_ABI = [
  // Read
  'function willName() view returns (string)',
  'function owner() view returns (address)',
  'function executor() view returns (string)',
  'function executed() view returns (bool)',
  'function paused() view returns (bool)',
  'function lastPing() view returns (uint256)',
  'function inactivitySeconds() view returns (uint256)',
  'function getWillInfo() view returns (string name, address ownerAddr, bool isExecuted, bool isPaused, uint256 createdAtApprox, uint256 lastActivity, uint256 inactivityThreshold, uint256 timeUntilTrigger)',
  'function getTotalBeneficiaries() view returns (uint256)',
  'function getBeneficiaries() view returns (tuple(address wallet, uint256 shareBps, string name, bool active)[])',
  'function getAssets() view returns (tuple(string assetType, string name, address contractAddr, uint256 amount, bool active)[])',
  'function getBalance() view returns (uint256)',
  'function canExecute() view returns (bool)',
  'function totalShareBps() view returns (uint256)',
  // Write
  'function ping() external',
  'function addBeneficiary(address payable _wallet, string calldata _name, uint256 _shareBps) external',
  'function removeBeneficiary(uint256 _index) external',
  'function addAsset(string calldata _type, string calldata _name, address _contractAddr, uint256 _amount) external',
  'function setExecutor(string calldata _executor) external',
  'function setInactivityDays(uint256 _days) external',
  'function setPaused(bool _paused) external',
  'function triggerExecution() external',
  'function selfExecute() external',
  // Events
  'event WillExecuted(address indexed executor, uint256 timestamp)',
  'event BeneficiaryAdded(address indexed wallet, string name, uint256 shareBps)',
  'event OwnerPinged(address indexed owner, uint256 timestamp)',
  'event ETHReceived(address indexed sender, uint256 amount)'
]

// ── Get ethers provider + signer (ENS-safe) ────────────────────────────────
export async function getProviderAndSigner() {
  const { BrowserProvider } = await import('ethers')
  const provider = new BrowserProvider(window.ethereum, 'any')
  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  const signer = await provider.getSigner(accounts[0])
  return { provider, signer, address: accounts[0] }
}

// ── Load a deployed contract and read all its on-chain data ────────────────
export async function loadContractData(contractAddress) {
  try {
    const { Contract } = await import('ethers')
    const { provider } = await getProviderAndSigner()
    const contract = new Contract(contractAddress, FULL_ABI, provider)

    // Read all data in parallel
    const [
      willInfo,
      beneficiaries,
      assets,
      balance,
      canExec
    ] = await Promise.all([
      contract.getWillInfo(),
      contract.getBeneficiaries(),
      contract.getAssets(),
      contract.getBalance(),
      contract.canExecute()
    ])

    const { formatEther } = await import('ethers')

    return {
      address: contractAddress,
      name: willInfo.name,
      owner: willInfo.ownerAddr,
      isExecuted: willInfo.isExecuted,
      isPaused: willInfo.isPaused,
      lastActivity: Number(willInfo.lastActivity),
      inactivityThreshold: Number(willInfo.inactivityThreshold),
      timeUntilTrigger: Number(willInfo.timeUntilTrigger),
      canExecute: canExec,
      balanceETH: formatEther(balance),
      beneficiaries: beneficiaries.map(b => ({
        wallet: b.wallet,
        name: b.name,
        shareBps: Number(b.shareBps),
        sharePercent: (Number(b.shareBps) / 100).toFixed(1),
        active: b.active
      })),
      assets: assets.map(a => ({
        assetType: a.assetType,
        name: a.name,
        contractAddr: a.contractAddr,
        amount: a.amount.toString(),
        active: a.active
      }))
    }
  } catch (err) {
    console.error('loadContractData error:', err)
    throw new Error('Could not load contract: ' + (err.shortMessage || err.message))
  }
}

// ── Ping the contract (reset inactivity timer) ─────────────────────────────
export async function pingContract(contractAddress) {
  try {
    const { Contract } = await import('ethers')
    const { signer } = await getProviderAndSigner()
    const contract = new Contract(contractAddress, FULL_ABI, signer)
    toast('⏳ Sending ping transaction...', 'info')
    const tx = await contract.ping()
    await tx.wait()
    toast('✅ Contract pinged! Inactivity timer reset.', 'success')
    return tx.hash
  } catch (err) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      toast('Ping rejected by user.', 'error')
    } else {
      toast('Ping failed: ' + (err.shortMessage || err.message), 'error')
    }
    throw err
  }
}

// ── Self-execute the will (owner manually triggers transfer) ───────────────
export async function selfExecuteWill(contractAddress) {
  try {
    const { Contract } = await import('ethers')
    const { signer } = await getProviderAndSigner()
    const contract = new Contract(contractAddress, FULL_ABI, signer)
    toast('⏳ Executing will — MetaMask confirmation needed...', 'info')
    const tx = await contract.selfExecute()
    await tx.wait()
    toast('✅ Will executed! Assets transferred to beneficiaries.', 'success')
    return tx.hash
  } catch (err) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      toast('Execution rejected by user.', 'error')
    } else {
      toast('Execution failed: ' + (err.shortMessage || err.message), 'error')
    }
    throw err
  }
}

// ── Trigger execution (anyone can call if inactivity period passed) ─────────
export async function triggerExecution(contractAddress) {
  try {
    const { Contract } = await import('ethers')
    const { signer } = await getProviderAndSigner()
    const contract = new Contract(contractAddress, FULL_ABI, signer)
    toast('⏳ Triggering will execution...', 'info')
    const tx = await contract.triggerExecution()
    await tx.wait()
    toast('✅ Will executed! Assets have been distributed.', 'success')
    return tx.hash
  } catch (err) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      toast('Transaction rejected.', 'error')
    } else {
      // Parse common revert reasons
      const msg = err.message || ''
      if (msg.includes('owner still active')) {
        toast('❌ Cannot execute: owner is still active. Inactivity period not passed.', 'error')
      } else if (msg.includes('already executed')) {
        toast('❌ Will already executed.', 'error')
      } else if (msg.includes('paused')) {
        toast('❌ Will is paused.', 'error')
      } else {
        toast('Trigger failed: ' + (err.shortMessage || err.message), 'error')
      }
    }
    throw err
  }
}

// ── Fund the contract with ETH (so it has assets to distribute) ────────────
export async function fundContract(contractAddress, ethAmount) {
  try {
    const { parseEther } = await import('ethers')
    const { signer } = await getProviderAndSigner()
    toast(`⏳ Sending ${ethAmount} ETH to contract...`, 'info')
    const tx = await signer.sendTransaction({
      to: contractAddress,
      value: parseEther(String(ethAmount))
    })
    await tx.wait()
    toast(`✅ Contract funded with ${ethAmount} ETH!`, 'success')
    return tx.hash
  } catch (err) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      toast('Funding rejected by user.', 'error')
    } else {
      toast('Funding failed: ' + (err.shortMessage || err.message), 'error')
    }
    throw err
  }
}

// ── Format seconds into human-readable time ────────────────────────────────
export function formatTimeRemaining(seconds) {
  if (seconds <= 0) return 'Executable now'
  const days  = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins  = Math.floor((seconds % 3600) / 60)
  if (days > 0)  return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${mins}m remaining`
  return `${mins}m remaining`
}

// ── Save contract address to localStorage so it persists ──────────────────
export function saveContractToStorage(address, name) {
  try {
    const saved = JSON.parse(localStorage.getItem('aegis_contracts') || '[]')
    if (!saved.find(c => c.address === address)) {
      saved.push({ address, name, savedAt: Date.now() })
      localStorage.setItem('aegis_contracts', JSON.stringify(saved))
    }
  } catch (e) { console.warn('Storage error:', e) }
}

export function getSavedContracts() {
  try {
    return JSON.parse(localStorage.getItem('aegis_contracts') || '[]')
  } catch { return [] }
}

export function removeSavedContract(address) {
  try {
    const saved = JSON.parse(localStorage.getItem('aegis_contracts') || '[]')
    localStorage.setItem('aegis_contracts', JSON.stringify(saved.filter(c => c.address !== address)))
  } catch (e) { console.warn('Storage error:', e) }
}
