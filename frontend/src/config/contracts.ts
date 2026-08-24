import { type Address } from "viem";

export const CONTRACT_ADDRESSES = {
  registry: (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3") as Address,
  dispatcher: (process.env.NEXT_PUBLIC_DISPATCHER_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as Address,
  mockCalc: (process.env.NEXT_PUBLIC_MOCK_CALC_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as Address,
  mockToken: (process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9") as Address,
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
    selector: "0xb3e16b9b",
    category: "MockCalc",
    inputs: [
      { name: "a", type: "uint256", placeholder: "e.g. 100" },
      { name: "b", type: "uint256", placeholder: "e.g. 58" }
    ]
  },
  {
    name: "mul",
    signature: "mul(uint256,uint256)",
    selector: "0xc8a4a50f",
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
