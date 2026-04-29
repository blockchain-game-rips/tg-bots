import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { formattedAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'
import { REVEAL_ALL_PAYLOAD, REVEAL_ONE_PAYLOAD } from './reveal-prizes-page'

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
			`<a href="${revealedPrize.card.imageUrl}">${revealedPrize.card.name}</a> — Ticket #${revealedPrize.ticketNumber} — ${formattedAmountWithUsd(prizeCurrencyAmount)}`,
			`Unrevealed tickets: ${unrevealedPrizes.length}`,
		]

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildActionData(
						actionIds.showRevealPrizes,
						REVEAL_ONE_PAYLOAD,
					),
				)
				.row()
				.text(
					'Reveal all',
					buildActionData(
						actionIds.showRevealPrizes,
						REVEAL_ALL_PAYLOAD,
					),
				)
				.row()
		}

		return {
			message: messageFromLines(lines),
			keyboard: addNav(keyboard, {
				home: actionIds.showHome,
				parent: actionIds.showPlay,
			}),
		}
	}
}
