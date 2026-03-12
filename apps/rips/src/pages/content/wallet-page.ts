import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class WalletPage {
	static render(): PageContent {
		const message = 'Wallet with ballance'
		const keyboard = addNav(
			new InlineKeyboard(
				composeMarkup([{ label: 'All balances', pageId: '' }]),
			),
			{ home: pageIds.home, parent: pageIds.home },
		)

		return {
			message,
			keyboard,
		}
	}
}
