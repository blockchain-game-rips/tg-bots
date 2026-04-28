import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { composeMarkup } from '../utils'

export class HomePage {
	static render(): PageContent {
		const lines: string[] = [
			'Welcome to Rips!',
			'',
			'Get started in two steps:',
			'· Deposit ETH on Base via the Wallet menu',
			'· Play the game and earn rewards',
		]

		const message = lines.join('\n')

		return {
			message,
			keyboard: new InlineKeyboard(
				composeMarkup([
					{ label: 'Play', actionId: actionIds.showPlay },
					'row',
					{ label: 'Wallet', actionId: actionIds.showWallet },
					'row',
					{
						label: 'Referral System',
						actionId: actionIds.showReferral,
					},
					'row',
					{ label: 'About', actionId: actionIds.showAbout },
				]),
			),
		}
	}
}
