// blockchains.ts reads NODE_ENV once, when loaded: each environment loads its own copy.
const load = (nodeEnv: string): typeof import("../src/blockchains") => {
  const saved = process.env.NODE_ENV;
  process.env.NODE_ENV = nodeEnv;
  let mod: typeof import("../src/blockchains") | undefined;
  jest.isolateModules(() => {
    mod = require("../src/blockchains");
  });
  process.env.NODE_ENV = saved;
  return mod!;
};

describe("in production", () => {
  const { resolveNetworkForCurrency, resolveAlchemyNetworkForCurrency, resolveNativeWalletCurrency } = load("production");

  test.each([
    ["ETH", "sepolia", "Ethereum"],
    ["ETH", "testnet", "Ethereum"],
    ["ETH", "EthereumSepolia", "Ethereum"],
    ["BTC", "sepolia", "Bitcoin"],
    ["SOL", "devnet", "Solana"],
    ["USDC", "sepolia", "Ethereum"],
    ["ETH", "mainnet", "Ethereum"],
    ["ETH", undefined, "Ethereum"],
  ])("a %s order preferring %s is on %s", (currency, preferred, network) => {
    expect(resolveNetworkForCurrency(currency, preferred)).toBe(network);
  });

  test("a testnet alias never yields a testnet Alchemy network", () => {
    expect(resolveAlchemyNetworkForCurrency("ETH", "sepolia")).toBe(resolveAlchemyNetworkForCurrency("ETH", "mainnet"));
  });

  test("a native refund asset keeps its mainnet symbol", () => {
    expect(resolveNativeWalletCurrency("ETH", "sepolia")).toBe("ETH");
  });
});

describe("in staging", () => {
  const { resolveNetworkForCurrency, resolveAlchemyNetworkForCurrency } = load("staging");

  test.each([
    ["ETH", "mainnet", "EthereumSepolia"],
    ["ETH", "Ethereum", "EthereumSepolia"],
    ["ETH", "sepolia", "EthereumSepolia"],
    ["BTC", "mainnet", "BitcoinSignet"],
    ["SOL", undefined, "SolanaDevnet"],
  ])("a %s order preferring %s is on %s", (currency, preferred, network) => {
    expect(resolveNetworkForCurrency(currency, preferred)).toBe(network);
  });

  test("a mainnet alias never yields a mainnet Alchemy network", () => {
    expect(resolveAlchemyNetworkForCurrency("ETH", "mainnet")).toBe(resolveAlchemyNetworkForCurrency("ETH", "sepolia"));
  });
});

test("a preferred chain picks among a currency's chains, in its environment's network", () => {
  expect(load("production").resolveNetworkForCurrency("ETH", "optimism")).toBe("Optimism");
  expect(load("production").resolveNetworkForCurrency("ETH", "OptimismSepolia")).toBe("Optimism");
  expect(load("staging").resolveNetworkForCurrency("ETH", "optimism")).toBe("OptimismSepolia");
});
