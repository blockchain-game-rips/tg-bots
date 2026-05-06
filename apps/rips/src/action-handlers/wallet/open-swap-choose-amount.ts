import { walletsControllerGetBalances } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { SwapChooseAmountPage } from '../../pages/wallet/swap-choose-amount'
import { EffectType } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { ErrorToRender } from '../../utils/error-to-render'
import { assertFlow } from '../../utils/session-utils'

export const openSwapChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'swap', 'idle')

		const { currencyIn, currencyOut } = session.flow.data

		if (currencyIn === undefined)
			throw new ErrorToRender('Select token in first')

		const currencyIds = [toCurrencyId(currencyIn.chainAddress)]
		if (currencyOut !== undefined)
			currencyIds.push(toCurrencyId(currencyOut.chainAddress))

		const { data: balancesData } = await walletsControllerGetBalances({
			headers: { 'x-telegram-id': session.telegramId },
			query: { chainAddress: currencyIds },
		})

		const currencyInBalance = balancesData.balances.find(
			(b) => b.currency.id === currencyIn.id,
		)!

		const currencyOutBalance = currencyOut
			? balancesData.balances.find(
					(b) => b.currency.id === currencyOut.id,
				)
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
