import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { PageContent } from '../../types'
import { configName } from '../../utils/stake'

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
