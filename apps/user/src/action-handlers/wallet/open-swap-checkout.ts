import { ChainAddressDto } from '@rips/api-client'
import { ActionDef, noPayload, withPayload } from '../../action-def'
import { rawStringCodec } from '../../utils/codecs'
import { currencyChainAddressCodec } from '../../utils/currency'

export const openSwapCheckout: ActionDef<void> = noPayload(() => {
	// TODO: swap: implement
	throw new Error('Not implemented')
})

export const openSwapCheckoutFromSrc: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)

export const openSwapCheckoutFromDst: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)

export const openSwapCheckoutFromAmount: ActionDef<string> = withPayload(
	rawStringCodec,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
