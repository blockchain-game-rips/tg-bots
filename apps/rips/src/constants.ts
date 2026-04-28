import { ChainAddressDto, CurrencyDto } from '../generated/api-client'
import { Chain } from './types'

export const EIP155_NAMESPACE = 'eip155'

export const NATIVE_ON_BASE: ChainAddressDto = {
	address: '0x0000000000000000000000000000000000000000',
	chain: {
		namespace: EIP155_NAMESPACE,
		reference: '8453',
	},
}

const ARBITRUM_CHAIN = { namespace: EIP155_NAMESPACE, reference: '42161' }
const BASE_CHAIN = { namespace: EIP155_NAMESPACE, reference: '8453' }

export const SUPPORTED_CHAINS: Chain[] = [
	{
		name: 'Arbitrum',
		...ARBITRUM_CHAIN,
	},
	{
		name: 'Base',
		...BASE_CHAIN,
	},
]

export const SUPPORTED_CURRENCIES: Omit<CurrencyDto, 'priceUsd'>[] = [
	{
		//TODO: parse id from chain address or vise versa
		id: 'eip155:42161:0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
		symbol: 'USDC',
		name: 'USD Coin',
		decimals: 6,
		chainAddress: {
			address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
			chain: ARBITRUM_CHAIN,
		},
	},
	{
		id: '2',
		symbol: 'ETH',
		name: 'Ethereum',
		decimals: 18,
		chainAddress: {
			address: '0x0000000000000000000000000000000000000000',
			chain: ARBITRUM_CHAIN,
		},
	},
	{
		id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
		symbol: 'USDC',
		name: 'USD Coin',
		decimals: 6,
		chainAddress: {
			address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
			chain: BASE_CHAIN,
		},
	},
]
