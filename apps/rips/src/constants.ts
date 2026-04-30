import { ChainAddressDto } from '../generated/api-client'

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

export const SUPPORTED_CHAINS = [ARBITRUM_CHAIN, BASE_CHAIN]

export const SUPPORTED_CURRENCIES: ChainAddressDto[] = [
	{
		address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
		chain: ARBITRUM_CHAIN,
	},
	{
		address: '0x0000000000000000000000000000000000000000',
		chain: ARBITRUM_CHAIN,
	},
	{
		address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
		chain: BASE_CHAIN,
	},
]
