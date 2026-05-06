import { walletsControllerGetBalances } from '../../../generated/api-client'
import { createQuerySerializer } from '../../../generated/api-client/client/utils.gen'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { setFlow } from '../../utils/session-utils'
import { parseCurrencyIndex } from '../../validation/currency-index'

export const openWithdraw: ActionDef<number> = withPayload(
	(currencyIndex) => currencyIndex.toString(),
	(raw) => parseCurrencyIndex(raw),
	async (session, currencyIndex) => {
		const currencyChainAddress = SUPPORTED_CURRENCIES[currencyIndex]

		const { data: balancesData } = await walletsControllerGetBalances({
			headers: { 'x-telegram-id': session.telegramId },
			query: { chainAddress: [toCurrencyId(currencyChainAddress)] },
			querySerializer: createQuerySerializer({ allowReserved: true }),
		})

		const currencyBalance = balancesData.balances[0]

		setFlow(session, 'withdraw', 'currency-chosen', {
			currency: currencyBalance.currency,
		})

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(currencyBalance, undefined, undefined),
		}
	},
)
