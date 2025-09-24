export declare const blockchainNames: readonly ["bitcoin", "litecoin", "dogecoin", "bitcoincash", "polygon", "arbitrum", "base", "bsc", "optimism", "avalanche", "celo", "fantom", "solana", "stellar", "xrpl", "cardano", "kaspa", "polkadot", "sui", "aptos", "algorand", "tron", "tezos", "internetcomputer", "iota", "polymesh", "kusama", "ethereum"];
type Entry = {
    name: typeof blockchainNames[number];
    mainnet: string;
    testnet: string;
    alchemy?: {
        mainnet: string;
        testnet: string;
    };
};
type MapType = Record<string, Entry[]>;
export declare const currencyNetworkMap: MapType;
export declare function resolveNetworkForCurrency(currency?: string, preferred?: string): string;
export declare function listNetworksForCurrency(currency?: string): string[];
export declare function resolveAlchemyNetworkForCurrency(currency?: string, preferred?: string): string | undefined;
export declare function listAlchemyNetworksForCurrency(currency?: string): string[];
export declare function resolveBlockchainForCurrency(currency?: string, preferred?: string): "bitcoin" | "litecoin" | "dogecoin" | "bitcoincash" | "polygon" | "arbitrum" | "base" | "bsc" | "optimism" | "avalanche" | "celo" | "fantom" | "solana" | "stellar" | "xrpl" | "cardano" | "kaspa" | "polkadot" | "sui" | "aptos" | "algorand" | "tron" | "tezos" | "internetcomputer" | "iota" | "polymesh" | "kusama" | "ethereum" | undefined;
export declare function listBlockchains(): ("bitcoin" | "litecoin" | "dogecoin" | "bitcoincash" | "polygon" | "arbitrum" | "base" | "bsc" | "optimism" | "avalanche" | "celo" | "fantom" | "solana" | "stellar" | "xrpl" | "cardano" | "kaspa" | "polkadot" | "sui" | "aptos" | "algorand" | "tron" | "tezos" | "internetcomputer" | "iota" | "polymesh" | "kusama" | "ethereum")[];
export declare function listCurrenciesForBlockchain(blockchain?: string): string[];
export {};
