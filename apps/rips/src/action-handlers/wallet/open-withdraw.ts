import { ChainAddressDto } from '@rips/api-client'
import { setFlow } from '@rips/grammy-kit'
import { parseCurrencyChainAddress } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { findCurrencyIndex, toCurrencyId } from '../../utils/currency'

export const openWithdraw: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	(raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
	async (session, currencyChainAddress) => {
		const currencyBalance = await fetchSingleBalance(
			session.telegramId,
			toCurrencyId(currencyChainAddress),
		)

		setFlow(session, 'withdraw', 'currency-chosen', {
			currency: currencyBalance.currency,
		})

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(currencyBalance, undefined, undefined),
		}
	},
)
