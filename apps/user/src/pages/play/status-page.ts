import { RipDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { sameEvmAddress } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const StatusPage = {
	render(ongoingRips: RipDto[], userEvmAddress: string): PageContent {
		const userRips = ongoingRips.filter((r) =>
			r.actions.purchases.some((p) =>
				sameEvmAddress(p.userAddress, userEvmAddress),
			),
		)

		const lines: Line[] = [FormattedString.b('Status'), '']

		if (userRips.length === 0) {
			lines.push('You have no entries in ongoing rips.')
		} else {
			lines.push(
				fmt`🎟 ${FormattedString.b('Your entries in ongoing rips')}`,
				'',
			)

			for (const rip of userRips) {
				const userEntries = rip.actions.purchases
					.filter((p) =>
						sameEvmAddress(p.userAddress, userEvmAddress),
					)
					.reduce(
						(sum, purchase) => sum + Number(purchase.entryCount),
						0,
					)

				const entryLabel = userEntries === 1 ? 'entry' : 'entries'
				lines.push(
					`Rip #${rip.id.toString()} — ${userEntries.toString()} ${entryLabel}`,
				)
			}
		}

		const keyboard = addNav(
			new InlineKeyboard()
				.text(
					'Ongoing rips',
					buildActionData(actionIds.openOngoingRips, undefined),
				)
				.row()
				.text(
					'Completed rips',
					buildActionData(actionIds.openCompletedRips, undefined),
				),
			{ home: actionIds.openHome, parent: actionIds.openHome },
		)

		return { message: joinLines(lines), keyboard }
	},
}
