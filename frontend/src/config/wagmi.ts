import { http } from "wagmi";
import { mainnet, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, foundry } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3fcc6bba6f1de962d911bb5b5c3dba68";

export const wagmiConfig = getDefaultConfig({
  appName: "RouteX",
  projectId,
  chains: [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, foundry, mainnet],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [foundry.id]: http("http://127.0.0.1:8545"),
    [mainnet.id]: http(),
  },
  ssr: true,
});
