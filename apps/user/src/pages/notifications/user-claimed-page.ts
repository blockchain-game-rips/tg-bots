import { RipDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const UserClaimedRipPage = {
	render(rip: RipDto): PageContent {
		const preset = configName(rip.config)

		const lines = [
			`🏆 <b>Rip #${rip.id.toString()} is over — open your payouts!</b>`,
			'',
			`Preset: ${preset}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Open Rips 🎁',
			buildActionData(actionIds.openOpenPullsNoBack, undefined),
		)

		return {
			message: lines.join('\n'),
			keyboard,
		}
	},
}
