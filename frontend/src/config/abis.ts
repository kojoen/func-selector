export const FunctionRegistryAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_owner", type: "address", internalType: "address" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "register",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      { name: "implementation", type: "address", internalType: "address" },
      { name: "signature", type: "string", internalType: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "replace",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      { name: "newImplementation", type: "address", internalType: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "remove",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getImplementation",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "implementation", type: "address", internalType: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isRegistered",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "registered", type: "bool", internalType: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSignature",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "sig", type: "string", internalType: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAllSelectors",
    inputs: [],
    outputs: [{ name: "selectors", type: "bytes4[]", internalType: "bytes4[]" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "SelectorRegistered",
    inputs: [
      { name: "selector", type: "bytes4", indexed: true, internalType: "bytes4" },
      { name: "implementation", type: "address", indexed: true, internalType: "address" },
      { name: "signature", type: "string", indexed: false, internalType: "string" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SelectorReplaced",
    inputs: [
      { name: "selector", type: "bytes4", indexed: true, internalType: "bytes4" },
      { name: "oldImpl", type: "address", indexed: true, internalType: "address" },
      { name: "newImpl", type: "address", indexed: true, internalType: "address" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SelectorRemoved",
    inputs: [
      { name: "selector", type: "bytes4", indexed: true, internalType: "bytes4" },
      { name: "oldImplementation", type: "address", indexed: true, internalType: "address" }
    ],
    anonymous: false
  }
] as const;

export const FunctionDispatcherAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_registry", type: "address", internalType: "address" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registry",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract FunctionRegistry" }],
    stateMutability: "view"
  },
  {
    type: "fallback",
    stateMutability: "payable"
  },
  {
    type: "receive",
    stateMutability: "payable"
  },
  {
    type: "error",
    name: "CalldataTooShort",
    inputs: [{ name: "size", type: "uint256", internalType: "uint256" }]
  },
  {
    type: "error",
    name: "UnknownSelector",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }]
  },
  {
    type: "error",
    name: "ZeroImplementation",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }]
  }
] as const;

export const MockCalcAbi = [
  {
    type: "function",
    name: "add",
    inputs: [
      { name: "a", type: "uint256", internalType: "uint256" },
      { name: "b", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "result", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "sub",
    inputs: [
      { name: "a", type: "uint256", internalType: "uint256" },
      { name: "b", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "result", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "mul",
    inputs: [
      { name: "a", type: "uint256", internalType: "uint256" },
      { name: "b", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "result", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "div",
    inputs: [
      { name: "a", type: "uint256", internalType: "uint256" },
      { name: "b", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "result", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "mod",
    inputs: [
      { name: "a", type: "uint256", internalType: "uint256" },
      { name: "b", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "result", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure"
  }
] as const;

export const MockTokenAbi = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "success", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  }
] as const;
