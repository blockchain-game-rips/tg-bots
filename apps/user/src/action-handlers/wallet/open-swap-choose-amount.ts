import { ChainAddressDto } from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { currencyChainAddressCodec } from '../../utils/currency'

export const openSwapChooseAmount: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
