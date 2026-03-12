import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class WalletPage {
	static render(userBalance: number): PageContent {
		const message = `Balance: ${userBalance} ETH`
		const keyboard = addNav(
			new InlineKeyboard(
				composeMarkup([
					{ label: 'All balances', pageId: '' },
					{ label: 'Update', pageId: pageIds.wallet },
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
