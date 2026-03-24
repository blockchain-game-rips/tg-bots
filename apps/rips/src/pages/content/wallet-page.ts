import { InlineKeyboard } from 'grammy'
import { Balance } from '../../api/schemas'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class WalletPage {
	static render(balance: Balance): PageContent {
		const amount = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)
		const message = `Balance: ${amount} ${balance.currency.symbol}`
		const keyboard = addNav(
			new InlineKeyboard(
				composeMarkup([
					{ label: 'Update', pageId: pageIds.wallet },
					{ label: 'Withdraw', pageId: pageIds.chooseWithdrawAmount },
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
