import { InlineKeyboard } from 'grammy'
import { buildActionData } from '../grammy-kit/action/action-data'
import { actionIds } from '../grammy-kit/action/actions'
import { PageContent } from '../types'

export const HomePage = {
	render(): PageContent {
		const lines = [
			'👋 <b>Welcome to Rips!</b>',
			'',
			'Get started in two steps:',
			'· Deposit ETH on Base via the Wallet menu',
			'· Buy tickets and earn rewards',
		]

		const keyboard = new InlineKeyboard()
			.text('Play', buildActionData(actionIds.openPlay, undefined))
			.row()
			.text('Wallet', buildActionData(actionIds.openWallet, undefined))
			.row()
			.text(
				'Referral System',
				buildActionData(actionIds.openReferral, undefined),
			)
			.row()
			.text('About', buildActionData(actionIds.openAbout, undefined))

		return { message: lines.join('\n'), keyboard }
	},
}
