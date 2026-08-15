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
import * as labels from '../../utils/button-labels'

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
				labels.OPEN_PULLS,
				buildActionData(actionIds.openOpenPulls, undefined),
			)
			.row()
			.text(
				labels.ONGOING_RIPS,
				buildActionData(actionIds.openOngoingRips, undefined),
			)
			.row()
			.text(
				labels.FINALIZED_RIPS,
				buildActionData(actionIds.openFinalizedRips, false),
			)
			.appendNavButtons()

		return { message: joinLines(lines), keyboard }
	},
}
