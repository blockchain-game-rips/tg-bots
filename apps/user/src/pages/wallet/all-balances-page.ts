import { CurrencyAmountDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const AllBalancesPage = {
	render(balances: CurrencyAmountDto[]): PageContent {
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

		const keyboard = addNav(new InlineKeyboard(), {
			home: actionIds.openHome,
			parent: actionIds.openWallet,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
