import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

const TITLE = '🎁 Open Pulls'

function countSentence(unopenedCount: number): string {
	if (unopenedCount === 0) return 'You have no unopened pulls.'

	const noun = unopenedCount === 1 ? 'pull' : 'pulls'

	return `You have ${unopenedCount.toString()} unopened ${noun}.`
}

function buildOpenPullsContent(unopenedCount: number): {
	lines: Line[]
	keyboard: InlineKeyboard
} {
	const lines: Line[] = [
		FormattedString.b(TITLE),
		'',
		countSentence(unopenedCount),
	]

	const keyboard = new InlineKeyboard()

	if (unopenedCount === 0) {
		keyboard
			.text(
				'Enter Rips',
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()

		return { lines, keyboard }
	}

	lines.push(
		'',
		'Each pull reveals:',
		'• your result',
		'• your payout',
		'• one collectible card',
	)

	keyboard
		.text(
			'Reveal Next',
			buildActionData(actionIds.openRevealSingle, undefined),
		)
		.row()
		.text('Reveal All', buildActionData(actionIds.openRevealAll, undefined))
		.row()

	return { lines, keyboard }
}

export const RevealPayoutsPage = {
	render(unopenedCount: number): PageContent {
		const { lines, keyboard } = buildOpenPullsContent(unopenedCount)

		keyboard.appendNavButtons()

		return { message: joinLines(lines), keyboard }
	},
}

export const RevealPayoutsNoBackPage = {
	render(unopenedCount: number): PageContent {
		const { lines, keyboard } = buildOpenPullsContent(unopenedCount)

		keyboard.row().appendHomeButton()

		return { message: joinLines(lines), keyboard }
	},
}
