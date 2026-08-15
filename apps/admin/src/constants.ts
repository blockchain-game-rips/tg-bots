import { ChainAddressDtoOutput } from '@rips/api-client'

export const EIP155_NAMESPACE = 'eip155'

export const NATIVE_ON_BASE: ChainAddressDtoOutput = {
	address: '0x0000000000000000000000000000000000000000',
	chain: {
		namespace: EIP155_NAMESPACE,
		reference: '8453',
	},
}
