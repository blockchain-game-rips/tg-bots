import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { ErrorToRender } from '../../grammy-kit/effects/error-to-render'
import { assertFlow } from '../../grammy-kit/session/session-utils'
import { SwapChooseAmountPage } from '../../pages/wallet/swap-choose-amount'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'

export const openSwapChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'swap', 'idle')

		const { currencyIn, currencyOut } = session.flow.data

		if (currencyIn === undefined)
			throw new ErrorToRender('Select token in first')

		const currencyIds = [toCurrencyId(currencyIn.chainAddress)]
		if (currencyOut !== undefined)
			currencyIds.push(toCurrencyId(currencyOut.chainAddress))

		const balances = await fetchBalances(session.telegramId, currencyIds)

		const currencyInBalance = balances.find(
			(b) => b.currency.id === currencyIn.id,
		)
		if (currencyInBalance === undefined)
			throw new Error('Currency in balance not found')

		const currencyOutBalance = currencyOut
			? balances.find((b) => b.currency.id === currencyOut.id)
			: undefined

		return {
			type: EffectType.EDIT,
			page: SwapChooseAmountPage.render({
				currencyInBalance,
				currencyOutBalance,
			}),
		}
	},
)
