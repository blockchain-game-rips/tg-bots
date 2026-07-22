import { RipDto } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
} from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const UserRefundedRipPage = {
	render(rip: RipDto): PageContent {
		const preset = configName(rip.config)

		const lines = [
			fmt`↩️ ${FormattedString.b(`Rip #${rip.id.toString()} was refunded`)}`,
			'',
			`Preset: ${preset}`,
			'Your funds have been returned to your balance.',
		]

		const keyboard = new InlineKeyboard().text(
			'Check Wallet',
			buildActionData(actionIds.openWallet, undefined),
		)

		return {
			message: joinLines(lines),
			keyboard,
		}
	},
}
