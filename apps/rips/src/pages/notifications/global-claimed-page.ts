import { RoundDto } from '@rips/api-client'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'

export const GlobalClaimedRoundPage = {
	render(round: RoundDto): PageContent {
		const stake = configName(round.config)

		const lines = [
			`🏆 <b>Round #${round.id.toString()} Finished!</b>`,
			'',
			`Stake: ${stake}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard(),
		}
	},
}
