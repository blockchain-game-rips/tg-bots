import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

export class AllBalancesPage {
	static render(balances: CurrencyAmountDto[]): PageContent {
		const byChain = balances.reduce<Record<string, CurrencyAmountDto[]>>(
			(acc, b) => {
				const chain = b.currency.chainAddress.chain.reference
				;(acc[chain] ??= []).push(b)
				return acc
			},
			{},
		)

		const chainSections = Object.entries(byChain).flatMap(
			([chain, items]) => [
				`<b>${chain}</b>`,
				...items.map(
					(b) => `• ${b.currency.symbol}: ${formatAmountWithUsd(b)}`,
				),
				'',
			],
		)

		const lines = ['<b>All Balances</b>', '', ...chainSections]

		const keyboard = addNav(keyboardFromLayout([]), {
			home: actionIds.openHome,
			parent: actionIds.openWallet,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
