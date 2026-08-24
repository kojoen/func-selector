import { type Address } from "viem";

export const CONTRACT_ADDRESSES = {
  registry: (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x54254040faf67f85e96617d3ec600248c4b3ad37") as Address,
  dispatcher: (process.env.NEXT_PUBLIC_DISPATCHER_ADDRESS || "0x4bf0170e56452a3f02afeb84554b0ae5d26c6349") as Address,
  mockCalc: (process.env.NEXT_PUBLIC_MOCK_CALC_ADDRESS || "0x5dfd8159f5c72c582d9871fd62100b115d25290e") as Address,
  mockToken: (process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || "0xf2087c6561224ca85d9e98028cf7d075640f3b11") as Address,
};

export interface SelectorItem {
  selector: `0x${string}`;
  signature: string;
  implementation: Address;
}

export const PRESET_FUNCTIONS = [
  {
    name: "add",
    signature: "add(uint256,uint256)",
    selector: "0x771602f7",
    category: "MockCalc",
    inputs: [
      { name: "a", type: "uint256", placeholder: "e.g. 10" },
      { name: "b", type: "uint256", placeholder: "e.g. 32" }
    ]
  },
  {
    name: "sub",
    signature: "sub(uint256,uint256)",
    selector: "0xb67d77c5",
    category: "MockCalc",
    inputs: [
      { name: "a", type: "uint256", placeholder: "e.g. 100" },
      { name: "b", type: "uint256", placeholder: "e.g. 58" }
    ]
  },
  {
    name: "mul",
    signature: "mul(uint256,uint256)",
    selector: "0xc8a4ac9c",
    category: "MockCalc",
    inputs: [
      { name: "a", type: "uint256", placeholder: "e.g. 6" },
      { name: "b", type: "uint256", placeholder: "e.g. 7" }
    ]
  },
  {
    name: "div",
    signature: "div(uint256,uint256)",
    selector: "0xa391c15b",
    category: "MockCalc",
    inputs: [
      { name: "a", type: "uint256", placeholder: "e.g. 84" },
      { name: "b", type: "uint256", placeholder: "e.g. 2" }
    ]
  },
  {
    name: "transfer",
    signature: "transfer(address,uint256)",
    selector: "0xa9059cbb",
    category: "MockToken",
    inputs: [
      { name: "to", type: "address", placeholder: "0xRecipientAddress..." },
      { name: "amount", type: "uint256", placeholder: "e.g. 1000000000000000000" }
    ]
  },
  {
    name: "mint",
    signature: "mint(address,uint256)",
    selector: "0x40c10f19",
    category: "MockToken",
    inputs: [
      { name: "to", type: "address", placeholder: "0xRecipientAddress..." },
      { name: "amount", type: "uint256", placeholder: "e.g. 1000000000000000000" }
    ]
  },
  {
    name: "balanceOf",
    signature: "balanceOf(address)",
    selector: "0x70a08231",
    category: "MockToken",
    inputs: [
      { name: "account", type: "address", placeholder: "0xAccountAddress..." }
    ]
  },
  {
    name: "totalSupply",
    signature: "totalSupply()",
    selector: "0x18160ddd",
    category: "MockToken",
    inputs: []
  }
];
