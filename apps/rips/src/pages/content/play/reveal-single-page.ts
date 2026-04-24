import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

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
					buildCommand({
						type: 'open',
						pageId: pageIds.revealSingle,
						payloads: [],
					}),
				)
				.row()
				.text(
					'Reveal all',
					buildCommand({
						type: 'open',
						pageId: pageIds.revealAll,
						payloads: [],
					}),
				)
				.row()
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.play,
			}),
		}
	}
}
