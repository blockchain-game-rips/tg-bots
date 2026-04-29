import { actionIds } from '../actions'
import { PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'
import { messageFromLines } from '../utils/message'

export class HomePage {
	static render(): PageContent {
		const lines: string[] = [
			'Welcome to Rips!',
			'',
			'Get started in two steps:',
			'· Deposit ETH on Base via the Wallet menu',
			'· Play the game and earn rewards',
		]

		return {
			message: messageFromLines(lines),
			keyboard: keyboardFromLayout([
				[{ label: 'Play', actionId: actionIds.showPlay }],
				[{ label: 'Wallet', actionId: actionIds.showWallet }],
				[
					{
						label: 'Referral System',
						actionId: actionIds.showReferral,
					},
				],
				[{ label: 'About', actionId: actionIds.showAbout }],
			]),
		}
	}
}
