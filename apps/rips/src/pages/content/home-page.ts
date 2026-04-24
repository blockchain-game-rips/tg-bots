import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { composeMarkup } from '../utils'

export class HomePage {
	static render(): PageContent {
		const lines: string[] = [
			'Welcome to Rips!',
			'',
			'Get started in two steps:',
			'· Deposit ETH on Base via the Wallet menu',
			'· Play the game and earn rewards',
			'',
			//TODO: better message
			'When a round completes, go to play/open rips',
		]

		const message = lines.join('\n')

		return {
			message,
			keyboard: new InlineKeyboard(
				composeMarkup([
					{ label: 'Play', pageId: pageIds.play },
					'row',
					{ label: 'Wallet', pageId: pageIds.wallet },
					'row',
					{ label: 'About', pageId: pageIds.about },
					'row',
					{ label: 'Referral System', pageId: pageIds.referralSystem },
				]),
			),
		}
	}
}
