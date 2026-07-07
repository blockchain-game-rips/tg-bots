import { PayoutDto, RipDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { tierName } from '../../utils/tiers'

export const RevealSinglePage = {
	render(
		rip: RipDto,
		revealedPayout: PayoutDto,
		unrevealedPayouts: PayoutDto[],
	): PageContent {
		const payoutCurrencyAmount = {
			amount: revealedPayout.payoutAmount,
			currency: rip.currency,
		}

		const lines = [
			'<b>Open Rips</b>',
			'',
			`🎁 <a href="${revealedPayout.card.imageUrl}">${revealedPayout.card.name}</a> [${tierName(revealedPayout.card.tier)}]`,
			`Entry #${revealedPayout.entryNumber.toString()} — ${formatAmountWithUsd(payoutCurrencyAmount)}`,
			'',
			`🎟 Unrevealed entries: ${unrevealedPayouts.length.toString()}`,
		]

		const keyboard = new InlineKeyboard()

		if (unrevealedPayouts.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildActionData(actionIds.openRevealSingle, undefined),
				)
				.row()
				.text(
					'Reveal all',
					buildActionData(actionIds.openRevealAll, undefined),
				)
				.row()
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	},
}
