import { RipDtoOutput } from '@rips/api-client'
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
	render(rip: RipDtoOutput): PageContent {
		const entryLevel = configName(rip.config)

		const lines = [
			fmt`↩️ ${FormattedString.b(`Rip #${rip.id.toString()} was refunded`)}`,
			'',
			`Entry level: ${entryLevel}`,
			'Your funds have been returned to your wallet.',
		]

		const keyboard = new InlineKeyboard().text(
			'💼 Wallet',
			buildActionData(actionIds.openWallet, undefined),
		)

		return {
			message: joinLines(lines),
			keyboard,
		}
	},
}
