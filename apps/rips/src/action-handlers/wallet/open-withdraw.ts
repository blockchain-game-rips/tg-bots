import { ChainAddressDto } from '@rips/api-client'
import { setFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../action-def'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { findCurrencyIndex, toCurrencyId } from '../../utils/currency'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const openWithdraw: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	(raw) => parseCurrencyChainAddress(raw),
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
