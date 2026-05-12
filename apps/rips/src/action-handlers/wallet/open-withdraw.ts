import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { setFlow } from '../../utils/session-utils'
import { parseCurrencyIndex } from '../../validation/currency-index'

export const openWithdraw: ActionDef<number> = withPayload(
	(currencyIndex) => currencyIndex.toString(),
	(raw) => parseCurrencyIndex(raw),
	async (session, currencyIndex) => {
		const currencyChainAddress = SUPPORTED_CURRENCIES[currencyIndex]

		if (currencyChainAddress === undefined)
			throw new Error(`Currency index out of range: ${currencyIndex}`)

		const balances = await fetchBalances(session.telegramId, [
			toCurrencyId(currencyChainAddress),
		])

		const currencyBalance = balances[0]

		if (currencyBalance === undefined) throw new Error('Balance not found')

		setFlow(session, 'withdraw', 'currency-chosen', {
			currency: currencyBalance.currency,
		})

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(currencyBalance, undefined, undefined),
		}
	},
)
