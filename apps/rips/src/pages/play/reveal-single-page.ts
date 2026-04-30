import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

export class RevealSinglePage {
	static render(
		round: RoundDto,
		revealedPrize: PrizeDto,
		unrevealedPrizes: PrizeDto[],
	): PageContent {
		const prizeCurrencyAmount = {
			amount: revealedPrize.prizeAmount,
			currency: round.currency,
		}

		const lines = [
			`<a href="${revealedPrize.card.imageUrl}">${revealedPrize.card.name}</a> — Ticket #${revealedPrize.ticketNumber} — ${formatAmountWithUsd(prizeCurrencyAmount)}`,
			`Unrevealed tickets: ${unrevealedPrizes.length}`,
		]

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildActionData(actionIds.showRevealSingle),
				)
				.row()
				.text('Reveal all', buildActionData(actionIds.showRevealAll))
				.row()
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(keyboard, {
				home: actionIds.showHome,
				parent: actionIds.showPlay,
			}),
		}
	}
}
