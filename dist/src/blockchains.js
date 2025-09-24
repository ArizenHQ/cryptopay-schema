"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyNetworkMap = exports.blockchainNames = void 0;
exports.resolveNetworkForCurrency = resolveNetworkForCurrency;
exports.listNetworksForCurrency = listNetworksForCurrency;
exports.resolveAlchemyNetworkForCurrency = resolveAlchemyNetworkForCurrency;
exports.listAlchemyNetworksForCurrency = listAlchemyNetworksForCurrency;
exports.resolveBlockchainForCurrency = resolveBlockchainForCurrency;
exports.listBlockchains = listBlockchains;
exports.listCurrenciesForBlockchain = listCurrenciesForBlockchain;
exports.resolveSecretNetworkLabel = resolveSecretNetworkLabel;
exports.blockchainNames = [
    "bitcoin", "litecoin", "dogecoin", "bitcoincash", "polygon", "arbitrum", "base", "bsc", "optimism", "avalanche", "celo", "fantom", "solana", "stellar", "xrpl", "cardano", "kaspa", "polkadot", "sui", "aptos", "algorand", "tron", "tezos", "internetcomputer", "iota", "polymesh", "kusama", "ethereum"
];
var isNonProd = ['development', 'staging'].includes(process.env.NODE_ENV || '');
exports.currencyNetworkMap = {
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
        { name: 'ethereum', mainnet: 'Ethereum', testnet: 'EthereumSepolia', alchemy: { mainnet: 'ETH_MAINNET', testnet: 'ETH_SEPOLIA' } },
        { name: 'optimism', mainnet: 'Optimism', testnet: 'OptimismSepolia', alchemy: { mainnet: 'OPT_MAINNET', testnet: 'OPT_SEPOLIA' } },
        { name: 'arbitrum', mainnet: 'ArbitrumOne', testnet: 'ArbitrumSepolia', alchemy: { mainnet: 'ARB_MAINNET', testnet: 'ARB_SEPOLIA' } },
        { name: 'base', mainnet: 'Base', testnet: 'BaseSepolia', alchemy: { mainnet: 'BASE_MAINNET', testnet: 'BASE_SEPOLIA' } },
        { name: 'polygon', mainnet: 'Polygon', testnet: 'PolygonAmoy', alchemy: { mainnet: 'MATIC_MAINNET', testnet: 'MATIC_AMOY' } }
    ]
};
function isTestnetAlias(value) {
    var v = String(value || '').toLowerCase();
    return [
        'test', 'testnet',
        // Common names
        'sepolia', 'goerli', 'holesky', 'mumbai', 'amoy', 'ghost', 'fuji', 'devnet', 'testnet3', 'nile', 'preprod', 'westend'
    ].includes(v);
}
function isMainnetAlias(value) {
    var v = String(value || '').toLowerCase();
    return ['main', 'mainnet', 'prod', 'production', 'livenet'].includes(v);
}
function resolveNetworkForCurrency(currency, preferred) {
    var key = String(currency || '').toUpperCase();
    var entries = exports.currencyNetworkMap[key];
    if (!entries || !entries.length)
        return key;
    if (preferred) {
        var p_1 = String(preferred).toLowerCase();
        // Direct match on chain name or full network labels
        var found = entries.find(function (e) {
            return e.mainnet.toLowerCase() === p_1 ||
                e.testnet.toLowerCase() === p_1 ||
                (e.name && e.name.toLowerCase() === p_1);
        });
        if (found)
            return isNonProd ? found.testnet : found.mainnet;
        // Legacy aliases: mainnet/testnet or specific testnet names
        if (isMainnetAlias(p_1))
            return entries[0].mainnet;
        if (isTestnetAlias(p_1))
            return entries[0].testnet;
    }
    var first = entries[0];
    return isNonProd ? first.testnet : first.mainnet;
}
function listNetworksForCurrency(currency) {
    var key = String(currency || '').toUpperCase();
    var entries = exports.currencyNetworkMap[key];
    if (!entries || !entries.length)
        return [];
    return entries.map(function (e) { return (isNonProd ? e.testnet : e.mainnet); });
}
function resolveAlchemyNetworkForCurrency(currency, preferred) {
    var key = String(currency || '').toUpperCase();
    var entries = exports.currencyNetworkMap[key];
    if (!entries || !entries.length)
        return undefined;
    var envKey = isNonProd ? 'testnet' : 'mainnet';
    if (preferred) {
        var p_2 = String(preferred).toLowerCase();
        var found = entries.find(function (e) {
            return e.mainnet.toLowerCase() === p_2 ||
                e.testnet.toLowerCase() === p_2 ||
                (e.name && e.name.toLowerCase() === p_2);
        });
        if (found && found.alchemy)
            return found.alchemy[envKey];
        if (isMainnetAlias(p_2)) {
            var f = entries.find(function (e) { return !!e.alchemy; });
            return f && f.alchemy ? f.alchemy.mainnet : undefined;
        }
        if (isTestnetAlias(p_2)) {
            var f = entries.find(function (e) { return !!e.alchemy; });
            return f && f.alchemy ? f.alchemy.testnet : undefined;
        }
    }
    var first = entries.find(function (e) { return !!e.alchemy; });
    if (!first)
        return undefined;
    return first.alchemy[envKey];
}
function listAlchemyNetworksForCurrency(currency) {
    var key = String(currency || '').toUpperCase();
    var entries = exports.currencyNetworkMap[key];
    if (!entries || !entries.length)
        return [];
    var envKey = isNonProd ? 'testnet' : 'mainnet';
    return entries.map(function (e) { return (e.alchemy ? e.alchemy[envKey] : undefined); }).filter(Boolean);
}
// Derive blockchain name for a currency based on a preferred hint
function resolveBlockchainForCurrency(currency, preferred) {
    var key = String(currency || '').toUpperCase();
    var entries = exports.currencyNetworkMap[key];
    if (!entries || !entries.length)
        return undefined;
    if (preferred) {
        var p_3 = String(preferred).toLowerCase();
        var found = entries.find(function (e) {
            return e.mainnet.toLowerCase() === p_3 ||
                e.testnet.toLowerCase() === p_3 ||
                (e.name && e.name.toLowerCase() === p_3);
        });
        if (found)
            return found.name;
        if (isMainnetAlias(p_3) || isTestnetAlias(p_3))
            return entries[0].name;
    }
    return entries[0].name;
}
// Utility helpers for UI
function listBlockchains() {
    return __spreadArray([], exports.blockchainNames, true);
}
function listCurrenciesForBlockchain(blockchain) {
    var b = String(blockchain || '').toLowerCase();
    var result = [];
    for (var _i = 0, _a = Object.entries(exports.currencyNetworkMap); _i < _a.length; _i++) {
        var _b = _a[_i], cur = _b[0], nets = _b[1];
        if (nets.some(function (e) { return e.name.toLowerCase() === b; }))
            result.push(cur);
    }
    return result.sort();
}
// Map blockchain -> default secret network label when not explicitly provided
// Used to compose secret keys like notification_crypto_pay_${blockchain}_${network}
function resolveSecretNetworkLabel(blockchain, preferred) {
    if (preferred)
        return String(preferred).toLowerCase();
    var b = String(blockchain || '').toLowerCase();
    if (!b)
        return isNonProd ? 'sepolia' : 'mainnet';
    if (!isNonProd)
        return 'mainnet';
    switch (b) {
        case 'ethereum': return 'sepolia';
        case 'polygon': return 'amoy'; // PolygonAmoy
        case 'arbitrum': return 'sepolia';
        case 'base': return 'sepolia';
        case 'optimism': return 'sepolia';
        case 'avalanche': return 'fuji';
        case 'bsc':
        case 'bnb': return 'testnet';
        case 'celo': return 'alfajores';
        case 'fantom': return 'testnet';
        case 'tezos': return 'ghost';
        default: return 'testnet';
    }
}
//# sourceMappingURL=blockchains.js.map