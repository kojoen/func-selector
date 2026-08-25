import { fallback, http } from "wagmi";
import { sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, mainnet, foundry } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Use developer project ID or fallback to standard development key
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c4f79cc821944d9680842e34466bfbd8";

export const SEPOLIA_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://gateway.tenderly.co/public/sepolia",
  "https://1rpc.io/sepolia",
];

export const wagmiConfig = getDefaultConfig({
  appName: "RouteX Protocol",
  appDescription: "Modular EVM Function Selector Router & Calldata Gateway",
  appUrl: typeof window !== "undefined" ? window.location.origin : "https://func-selector.vercel.app",
  appIcon: typeof window !== "undefined" ? `${window.location.origin}/icon.svg` : "https://func-selector.vercel.app/icon.svg",
  projectId: projectId.length === 32 ? projectId : "c4f79cc821944d9680842e34466bfbd8",
  chains: [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, mainnet, foundry],
  transports: {
    [sepolia.id]: fallback([
      http(SEPOLIA_RPCS[0]),
      http(SEPOLIA_RPCS[1]),
      http(SEPOLIA_RPCS[2]),
    ]),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [mainnet.id]: http(),
    [foundry.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
