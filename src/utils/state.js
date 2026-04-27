// src/utils/state.js
// Central application state — import and mutate from anywhere

export const state = {
  walletAddress: null,
  walletNetwork: null,
  walletBalance: null,
  contractAddress: null,
  wills: [],
  assets: [],
  beneficiaries: [],
  currentWillDraft: {
    name: '', executor: '', desc: '',
    trigger: 365, type: 'Standard Will',
    beneficiaries: [], assets: []
  }
}

export const ABI = [
  { inputs: [], name: 'createWill', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: '_beneficiary', type: 'address' }, { internalType: 'uint256', name: '_share', type: 'uint256' }], name: 'addBeneficiary', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'getWillInfo', outputs: [{ internalType: 'bool', name: 'active', type: 'bool' }, { internalType: 'uint256', name: 'createdAt', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'triggerExecution', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'getTotalBeneficiaries', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'ping', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'getBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'canExecute', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' }
]

export const ABI_STRING = JSON.stringify(ABI, null, 2)
