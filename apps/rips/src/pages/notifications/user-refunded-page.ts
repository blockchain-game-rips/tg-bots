import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { PageContent } from '../../types'
import { configName } from '../../utils/stake'

export const UserRefundedRoundPage = {
	render(round: RoundDto): PageContent {
		const stake = configName(round.config)

		const lines = [
			`↩️ <b>Round #${round.id.toString()} was refunded</b>`,
			'',
			`Stake: ${stake}`,
			'Your funds have been returned to your balance.',
		]

		const keyboard = new InlineKeyboard().text(
			'Check Wallet',
			buildActionData(actionIds.openWallet, undefined),
		)

		return {
			message: lines.join('\n'),
			keyboard,
		}
	},
}
