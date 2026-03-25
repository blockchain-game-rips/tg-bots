import { InlineKeyboard } from 'grammy'
import { Balance } from '../../api/schemas'
import { PageContent } from '../../types'
import { formatUnits, formatUsd } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class WalletPage {
	static render(
		balance: Balance,
		userEvmAddress: string,
		price: number,
	): PageContent {
		const amount = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		let message = ''
		message += `Balance: ${amount} ${balance.currency.symbol} ${formatUsd(amount, price)}`
		message += '\n\n'
		message += `Deposit ETH on Base to this address: <code>${userEvmAddress}</code>`

		const keyboard = addNav(
			new InlineKeyboard(
				composeMarkup([
					{ label: 'Update', pageId: pageIds.wallet },
					'row',
					{ label: 'Withdraw', pageId: pageIds.withdraw },
				]),
			),
			{ home: pageIds.home, parent: pageIds.home },
		)

		return {
			message,
			keyboard,
		}
	}
}
