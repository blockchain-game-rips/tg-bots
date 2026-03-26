import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { composeMarkup } from '../utils'

export class HomePage {
	static render(): PageContent {
		return {
			message:
				'Welcome to Rips!\n\nGet started in two steps:\n· Deposit ETH on Base via the Wallet menu\n· Play the game and earn rewards\n\nWhen a round completes, an Open Rips! button will appear in the Play menu — tap it to reveal your prizes.',
			keyboard: new InlineKeyboard(
				composeMarkup([
					{ label: 'Play', pageId: pageIds.play },
					'row',
					{ label: 'Wallet', pageId: pageIds.wallet },
					'row',
					{ label: 'About', pageId: pageIds.about },
				]),
			),
		}
	}
}
