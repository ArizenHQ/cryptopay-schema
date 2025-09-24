export const blockchainNames = [
    "bitcoin","litecoin","dogecoin","bitcoincash","polygon","arbitrum","base","bsc","optimism","avalanche","celo","fantom","solana","stellar","xrpl","cardano","kaspa","polkadot","sui","aptos","algorand","tron","tezos","internetcomputer","iota","polymesh","kusama","ethereum"
  ] as const;
  
  type Entry = {
    name: typeof blockchainNames[number];
    mainnet: string;
    testnet: string;
    alchemy?: { mainnet: string; testnet: string };
  };
  
  type MapType = Record<string, Entry[]>;
  
  const isNonProd = ['development', 'staging'].includes(process.env.NODE_ENV || '');
  
  export const currencyNetworkMap: MapType = {
    BTC: [
      { name: 'bitcoin', mainnet: 'Bitcoin', testnet: 'BitcoinTestnet3' }
    ],
    LTC: [
      { name: 'litecoin', mainnet: 'Litecoin', testnet: 'LitecoinTestnet' }
    ],
    DOGE: [
      { name: 'dogecoin', mainnet: 'Dogecoin', testnet: 'DogecoinTestnet' }
    ],
    BCH: [
      { name: 'bitcoincash', mainnet: 'BitcoinCash', testnet: 'BitcoinCashTestnet' }
    ],
    POL: [
      { name: 'polygon', mainnet: 'Polygon', testnet: 'PolygonAmoy', alchemy: { mainnet: 'MATIC_MAINNET', testnet: 'MATIC_AMOY' } }
    ],
    MATIC: [
      { name: 'polygon', mainnet: 'Polygon', testnet: 'PolygonAmoy', alchemy: { mainnet: 'MATIC_MAINNET', testnet: 'MATIC_AMOY' } }
    ],
    ARB: [
      { name: 'arbitrum', mainnet: 'ArbitrumOne', testnet: 'ArbitrumSepolia', alchemy: { mainnet: 'ARB_MAINNET', testnet: 'ARB_SEPOLIA' } }
    ],
    BASE: [
      { name: 'base', mainnet: 'Base', testnet: 'BaseSepolia', alchemy: { mainnet: 'BASE_MAINNET', testnet: 'BASE_SEPOLIA' } }
    ],
    BSC: [
      { name: 'bsc', mainnet: 'Bsc', testnet: 'BscTestnet', alchemy: { mainnet: 'BNB_MAINNET', testnet: 'BNB_TESTNET' } }
    ],
    BNB: [
      { name: 'bsc', mainnet: 'Bsc', testnet: 'BscTestnet', alchemy: { mainnet: 'BNB_MAINNET', testnet: 'BNB_TESTNET' } }
    ],
    OP: [
      { name: 'optimism', mainnet: 'Optimism', testnet: 'OptimismSepolia', alchemy: { mainnet: 'OPT_MAINNET', testnet: 'OPT_SEPOLIA' } }
    ],
    OPTIMISM: [
      { name: 'optimism', mainnet: 'Optimism', testnet: 'OptimismSepolia', alchemy: { mainnet: 'OPT_MAINNET', testnet: 'OPT_SEPOLIA' } }
    ],
    AVAX: [
      { name: 'avalanche', mainnet: 'AvalancheC', testnet: 'AvalancheCFuji', alchemy: { mainnet: 'AVAX_MAINNET', testnet: 'AVAX_FUJI' } }
    ],
    CELO: [
      { name: 'celo', mainnet: 'Celo', testnet: 'CeloAlfajores', alchemy: { mainnet: 'CELO_MAINNET', testnet: 'CELO_ALFAJORES' } }
    ],
    FTM: [
      { name: 'fantom', mainnet: 'FantomOpera', testnet: 'FantomTestnet', alchemy: { mainnet: 'FANTOM_MAINNET', testnet: 'FANTOM_TESTNET' } }
    ],
    SOL: [
      { name: 'solana', mainnet: 'Solana', testnet: 'SolanaDevnet', alchemy: { mainnet: 'SOLANA_MAINNET', testnet: 'SOLANA_DEVNET' } }
    ],
    XLM: [
      { name: 'stellar', mainnet: 'Stellar', testnet: 'StellarTestnet' }
    ],
    XRP: [
      { name: 'xrpl', mainnet: 'XrpLedger', testnet: 'XrpLedgerTestnet' }
    ],
    ADA: [
      { name: 'cardano', mainnet: 'Cardano', testnet: 'CardanoPreprod' }
    ],
    KAS: [
      { name: 'kaspa', mainnet: 'Kaspa', testnet: 'KaspaTestnet11' }
    ],
    DOT: [
      { name: 'polkadot', mainnet: 'Polkadot', testnet: 'Westend' }
    ],
    SUI: [
      { name: 'sui', mainnet: 'Sui', testnet: 'SuiTestnet' }
    ],
    APT: [
      { name: 'aptos', mainnet: 'Aptos', testnet: 'AptosTestnet' }
    ],
    ALGO: [
      { name: 'algorand', mainnet: 'Algorand', testnet: 'AlgorandTestnet' }
    ],
    TRX: [
      { name: 'tron', mainnet: 'Tron', testnet: 'TronNile' }
    ],
    XTZ: [
      { name: 'tezos', mainnet: 'Tezos', testnet: 'TezosGhostnet' }
    ],
    ICP: [
      { name: 'internetcomputer', mainnet: 'InternetComputer', testnet: 'InternetComputer' }
    ],
    IOTA: [
      { name: 'iota', mainnet: 'Iota', testnet: 'IotaTestnet' }
    ],
    POLYX: [
      { name: 'polymesh', mainnet: 'Polymesh', testnet: 'PolymeshTestnet' }
    ],
    KSM: [
      { name: 'kusama', mainnet: 'Kusama', testnet: 'Westend' }
    ],
    ETH: [
      { name: 'ethereum', mainnet: 'Ethereum',    testnet: 'EthereumSepolia', alchemy: { mainnet: 'ETH_MAINNET',  testnet: 'ETH_SEPOLIA' } },
      { name: 'optimism', mainnet: 'Optimism',    testnet: 'OptimismSepolia', alchemy: { mainnet: 'OPT_MAINNET',  testnet: 'OPT_SEPOLIA' } },
      { name: 'arbitrum', mainnet: 'ArbitrumOne', testnet: 'ArbitrumSepolia', alchemy: { mainnet: 'ARB_MAINNET',  testnet: 'ARB_SEPOLIA' } },
      { name: 'base',     mainnet: 'Base',        testnet: 'BaseSepolia',     alchemy: { mainnet: 'BASE_MAINNET', testnet: 'BASE_SEPOLIA' } },
      { name: 'polygon',  mainnet: 'Polygon',     testnet: 'PolygonAmoy',     alchemy: { mainnet: 'MATIC_MAINNET', testnet: 'MATIC_AMOY' } }
    ]
  };
  
  function isTestnetAlias(value?: string) {
    const v = String(value || '').toLowerCase();
    return [
      'test', 'testnet',
      // Common names
      'sepolia', 'goerli', 'holesky', 'mumbai', 'amoy', 'ghost', 'fuji', 'devnet', 'testnet3', 'nile', 'preprod', 'westend'
    ].includes(v);
  }
  
  function isMainnetAlias(value?: string) {
    const v = String(value || '').toLowerCase();
    return ['main', 'mainnet', 'prod', 'production', 'livenet'].includes(v);
  }
  
  export function resolveNetworkForCurrency(currency?: string, preferred?: string) {
    const key = String(currency || '').toUpperCase();
    const entries = currencyNetworkMap[key];
    if (!entries || !entries.length) return key;
    if (preferred) {
      const p = String(preferred).toLowerCase();
      // Direct match on chain name or full network labels
      const found = entries.find(e =>
        e.mainnet.toLowerCase() === p ||
        e.testnet.toLowerCase() === p ||
        (e.name && e.name.toLowerCase() === p)
      );
      if (found) return isNonProd ? found.testnet : found.mainnet;
      // Legacy aliases: mainnet/testnet or specific testnet names
      if (isMainnetAlias(p)) return entries[0].mainnet;
      if (isTestnetAlias(p)) return entries[0].testnet;
    }
    const first = entries[0];
    return isNonProd ? first.testnet : first.mainnet;
  }
  
  export function listNetworksForCurrency(currency?: string) {
    const key = String(currency || '').toUpperCase();
    const entries = currencyNetworkMap[key];
    if (!entries || !entries.length) return [];
    return entries.map(e => (isNonProd ? e.testnet : e.mainnet));
  }
  
  export function resolveAlchemyNetworkForCurrency(currency?: string, preferred?: string) {
    const key = String(currency || '').toUpperCase();
    const entries = currencyNetworkMap[key];
    if (!entries || !entries.length) return undefined;
    const envKey = isNonProd ? 'testnet' : 'mainnet';
    if (preferred) {
      const p = String(preferred).toLowerCase();
      const found = entries.find(e =>
        e.mainnet.toLowerCase() === p ||
        e.testnet.toLowerCase() === p ||
        (e.name && e.name.toLowerCase() === p)
      );
      if (found && found.alchemy) return found.alchemy[envKey];
      if (isMainnetAlias(p)) {
        const f = entries.find(e => !!e.alchemy);
        return f && f.alchemy ? f.alchemy.mainnet : undefined;
      }
      if (isTestnetAlias(p)) {
        const f = entries.find(e => !!e.alchemy);
        return f && f.alchemy ? f.alchemy.testnet : undefined;
      }
    }
    const first = entries.find((e): e is Entry & { alchemy: { mainnet: string; testnet: string } } => !!e.alchemy);
    if (!first) return undefined;
    return first.alchemy[envKey];
  }
  
  export function listAlchemyNetworksForCurrency(currency?: string) {
    const key = String(currency || '').toUpperCase();
    const entries = currencyNetworkMap[key];
    if (!entries || !entries.length) return [];
    const envKey = isNonProd ? 'testnet' : 'mainnet';
    return entries.map(e => (e.alchemy ? e.alchemy[envKey] : undefined)).filter(Boolean) as string[];
  }

  // Derive blockchain name for a currency based on a preferred hint
  export function resolveBlockchainForCurrency(currency?: string, preferred?: string) {
    const key = String(currency || '').toUpperCase();
    const entries = currencyNetworkMap[key];
    if (!entries || !entries.length) return undefined;
    if (preferred) {
      const p = String(preferred).toLowerCase();
      const found = entries.find(e =>
        e.mainnet.toLowerCase() === p ||
        e.testnet.toLowerCase() === p ||
        (e.name && e.name.toLowerCase() === p)
      );
      if (found) return found.name;
      if (isMainnetAlias(p) || isTestnetAlias(p)) return entries[0].name;
    }
    return entries[0].name;
  }

  // Utility helpers for UI
  export function listBlockchains() {
    return [...blockchainNames];
  }

  export function listCurrenciesForBlockchain(blockchain?: string) {
    const b = String(blockchain || '').toLowerCase();
    const result: string[] = [];
    for (const [cur, nets] of Object.entries(currencyNetworkMap)) {
      if (nets.some(e => e.name.toLowerCase() === b)) result.push(cur);
    }
    return result.sort();
  }