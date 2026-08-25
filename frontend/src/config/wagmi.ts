import { http } from "wagmi";
import { mainnet, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, foundry } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Use developer project ID or fallback to standard public development key
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c4f79cc821944d9680842e34466bfbd";

export const wagmiConfig = getDefaultConfig({
  appName: "RouteX Protocol",
  appDescription: "Modular EVM Function Selector Router & Calldata Gateway",
  appUrl: typeof window !== "undefined" ? window.location.origin : "https://routex.internal",
  appIcon: typeof window !== "undefined" ? `${window.location.origin}/icon.svg` : "/icon.svg",
  projectId: projectId.length === 32 ? projectId : "c4f79cc821944d9680842e34466bfbd8",
  chains: [foundry, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, mainnet],
  transports: {
    [foundry.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
