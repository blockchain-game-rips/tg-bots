import { ChainAddressDtoOutput } from '@rips/api-client'

export const EIP155_NAMESPACE = 'eip155'

export const ETHEREUM_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '1',
} as const
export const BNB_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '56',
} as const
// const POLYGON_CHAIN = { namespace: EIP155_NAMESPACE, reference: '137' } as const
export const ARBITRUM_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '42161',
} as const
// const AVALANCHE_CHAIN = { namespace: EIP155_NAMESPACE, reference: '43114' } as const
export const OPTIMISM_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '10',
} as const
export const BASE_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '8453',
} as const

export const SUPPORTED_CHAINS = [
	ETHEREUM_CHAIN,
	BNB_CHAIN,
	// POLYGON_CHAIN,
	ARBITRUM_CHAIN,
	// AVALANCHE_CHAIN,
	OPTIMISM_CHAIN,
	BASE_CHAIN,
] as const

const NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'

/** Stand-in recipient for quotes taken before the user has entered one. */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const NATIVE_ON_BASE: ChainAddressDtoOutput = {
	address: NATIVE_ADDRESS,
	chain: BASE_CHAIN,
}

export function nativeChainAddress(
	chain: ChainAddressDtoOutput['chain'],
): ChainAddressDtoOutput {
	return { address: NATIVE_ADDRESS, chain }
}

export function isNativeChainAddress(
	chainAddress: ChainAddressDtoOutput,
): boolean {
	return chainAddress.address.toLowerCase() === NATIVE_ADDRESS
}

export const SUPPORTED_CURRENCIES: ChainAddressDtoOutput[] = [
	// Ethereum
	{ address: NATIVE_ADDRESS, chain: ETHEREUM_CHAIN },
	{
		address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		chain: ETHEREUM_CHAIN,
	}, // WBTC
	{
		address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		chain: ETHEREUM_CHAIN,
	}, // WETH
	{
		address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		chain: ETHEREUM_CHAIN,
	}, // USDC
	{
		address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
		chain: ETHEREUM_CHAIN,
	}, // USDT

	// BNB
	{ address: NATIVE_ADDRESS, chain: BNB_CHAIN },
	{ address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', chain: BNB_CHAIN }, // WBTC
	{ address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', chain: BNB_CHAIN }, // WBNB
	{ address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', chain: BNB_CHAIN }, // USDC
	{ address: '0x55d398326f99059fF775485246999027B3197955', chain: BNB_CHAIN }, // USDT

	// // Polygon
	// { address: NATIVE_ADDRESS, chain: POLYGON_CHAIN },
	// {
	// 	address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
	// 	chain: POLYGON_CHAIN,
	// }, // WBTC
	// {
	// 	address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
	// 	chain: POLYGON_CHAIN,
	// }, // WMATIC
	// {
	// 	address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
	// 	chain: POLYGON_CHAIN,
	// }, // USDC
	// {
	// 	address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
	// 	chain: POLYGON_CHAIN,
	// }, // USDT

	// Arbitrum
	{ address: NATIVE_ADDRESS, chain: ARBITRUM_CHAIN },
	{
		address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
		chain: ARBITRUM_CHAIN,
	}, // WBTC
	{
		address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
		chain: ARBITRUM_CHAIN,
	}, // WETH
	{
		address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
		chain: ARBITRUM_CHAIN,
	}, // USDC
	{
		address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
		chain: ARBITRUM_CHAIN,
	}, // USDT

	// // Avalanche
	// { address: NATIVE_ADDRESS, chain: AVALANCHE_CHAIN },
	// {
	// 	address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
	// 	chain: AVALANCHE_CHAIN,
	// }, // WBTC
	// {
	// 	address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
	// 	chain: AVALANCHE_CHAIN,
	// }, // WAVAX
	// {
	// 	address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
	// 	chain: AVALANCHE_CHAIN,
	// }, // USDC
	// {
	// 	address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
	// 	chain: AVALANCHE_CHAIN,
	// }, // USDT

	// Optimism
	{ address: NATIVE_ADDRESS, chain: OPTIMISM_CHAIN },
	{
		address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
		chain: OPTIMISM_CHAIN,
	}, // WBTC
	{
		address: '0x4200000000000000000000000000000000000006',
		chain: OPTIMISM_CHAIN,
	}, // WETH
	{
		address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
		chain: OPTIMISM_CHAIN,
	}, // USDC
	{
		address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
		chain: OPTIMISM_CHAIN,
	}, // USDT

	// Base
	NATIVE_ON_BASE,
	{
		address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
		chain: BASE_CHAIN,
	}, // WBTC
	{
		address: '0x4200000000000000000000000000000000000006',
		chain: BASE_CHAIN,
	}, // WETH
	{
		address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
		chain: BASE_CHAIN,
	}, // USDC
]

export const NATIVE_MAX_MARGIN_USD = 0.1
