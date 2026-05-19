import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { configName } from '../../utils/stake'

export const UserClaimedRoundPage = {
	render(round: RoundDto): PageContent {
		const stake = configName(round.config)

		const lines = [
			`🏆 <b>Round #${round.id.toString()} is over — open your prizes!</b>`,
			'',
			`Stake: ${stake}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Open Rips 🎁',
			buildActionData(actionIds.openOpenRipsNoBack, undefined),
		)

		return {
			message: lines.join('\n'),
			keyboard,
		}
	},
}
