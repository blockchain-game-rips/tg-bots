import { ChainAddressDto } from '@rips/api-client'
import { parseCurrencyChainAddress } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { findCurrencyIndex } from '../../utils/currency'

export const openSwapChooseDstChain: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	(raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
