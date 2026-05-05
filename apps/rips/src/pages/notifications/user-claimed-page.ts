import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { configName } from '../../utils/stake'

export class UserClaimedRoundPage {
	static render(round: RoundDto): PageContent {
		const stake = configName(round.config)

		const lines = [
			`🏆 <b>Round #${round.id} is over — open your prizes!</b>`,
			'',
			`Stake: ${stake}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Open Rips 🎁',
			buildActionData(actionIds.openOpenRips, 'no-back'),
		)

		return {
			message: lines.join('\n'),
			keyboard,
		}
	}
}
