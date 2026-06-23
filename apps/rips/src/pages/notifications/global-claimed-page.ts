import { RipDto } from '@rips/api-client'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'

export const GlobalClaimedRipPage = {
	render(rip: RipDto): PageContent {
		const preset = configName(rip.config)

		const lines = [
			`🏆 <b>Rip #${rip.id.toString()} Finished!</b>`,
			'',
			`Preset: ${preset}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard(),
		}
	},
}
