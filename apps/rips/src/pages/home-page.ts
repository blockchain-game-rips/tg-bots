import { actionIds } from '../actions'
import { PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'

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
			message: lines.join('\n'),
			keyboard: keyboardFromLayout([
				[{ label: 'Play', actionId: actionIds.openPlay }],
				[{ label: 'Wallet', actionId: actionIds.openWallet }],
				[
					{
						label: 'Referral System',
						actionId: actionIds.openReferral,
					},
				],
				[{ label: 'About', actionId: actionIds.openAbout }],
			]),
		}
	}
}
