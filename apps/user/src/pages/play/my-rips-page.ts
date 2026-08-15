import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

interface MyRipsPageArgs {
	unopenedPulls: number
	activeEntries: number
	completedRips: number
	refundedRips: number
}

export const MyRipsPage = {
	render(args: MyRipsPageArgs): PageContent {
		const pullLabel = args.unopenedPulls === 1 ? 'pull' : 'pulls'

		const lines: Line[] = [
			fmt`📊 ${FormattedString.b('My Rips')}`,
			'',
			'🎁 Ready to open:',
			`${args.unopenedPulls.toString()} ${pullLabel}`,
			'',
			'⏳ Active entries:',
			args.activeEntries.toString(),
			'',
			'✅ Completed Rips:',
			args.completedRips.toString(),
			'',
			'↩️ Refunded Rips:',
			args.refundedRips.toString(),
		]

		const keyboard = new InlineKeyboard()
			.text(
				'🎁 Open Pulls',
				buildActionData(actionIds.openOpenPulls, undefined),
			)
			.row()
			.text(
				'⏳ Ongoing Rips',
				buildActionData(actionIds.openOngoingRips, undefined),
			)
			.row()
			.text(
				'🏁 Finalized Rips',
				buildActionData(actionIds.openFinalizedRips, false),
			)
			.appendNavButtons()

		return { message: joinLines(lines), keyboard }
	},
}
