import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { PageContent } from '../../types'
import { configName } from '../../utils/stake'

export const GlobalRefundedRoundPage = {
	render(round: RoundDto): PageContent {
		const stake = configName(round.config)

		const lines = [
			`↩️ <b>Round #${round.id.toString()} Refunded</b>`,
			'',
			`Stake: ${stake}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard(),
		}
	},
}
