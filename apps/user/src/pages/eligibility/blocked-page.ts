import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'

/**
 * The region refusal. `/start` is offered as a bare command with no button, so
 * nobody hammers Try Again in place, and the balance line is explicit because
 * gating every action really does hold funds until the user passes.
 */
export const BlockedPage = {
	render(): PageContent {
		const lines = [
			fmt`📍 ${FormattedString.b('Region Not Supported')}`,
			'',
			"Rips isn't available in your region, so you can't play from here.",
			'',
			'Nothing has happened to your account, and any balance stays yours. Run /start to check again.',
		]

		// `from([])` rather than the constructor, which leaves a stray empty row.
		return { message: joinLines(lines), keyboard: InlineKeyboard.from([]) }
	},
}
