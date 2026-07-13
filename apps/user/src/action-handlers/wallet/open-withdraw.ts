import { ChainAddressDto } from '@rips/api-client'
import { parseCurrencyChainAddress } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { toFlow } from '../../flows'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { findCurrencyIndex } from '../../utils/currency'

export const openWithdraw: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	(raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
	async (session, currencyChainAddress) => {
		const currencyBalance = await fetchSingleBalance(
			session.telegramId,
			currencyChainAddress,
		)

		const flow = toFlow('withdraw', 'currency-chosen', {
			currency: currencyBalance.currency,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: WithdrawPage.render(
					currencyBalance,
					undefined,
					undefined,
				),
			},
		}
	},
)
