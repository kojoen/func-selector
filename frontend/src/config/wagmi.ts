import { http, createConfig } from "wagmi";
import { mainnet, sepolia, foundry } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3fcc6bba6f1de962d911bb5b5c3dba68";

export const wagmiConfig = getDefaultConfig({
  appName: "Function Selector Router",
  projectId,
  chains: [foundry, sepolia, mainnet],
  transports: {
    [foundry.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
