import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

export class RevealAllPage {
	static render(
		rounds: RoundDto[],
		revealedPrizes: PrizeDto[],
		unrevealedPrizes: PrizeDto[],
	): PageContent {
		const lines: string[] = []

		lines.push(`Unrevealed tickets: ${unrevealedPrizes.length}`)
		lines.push('')
		lines.push('Your prizes:')

		for (const prize of revealedPrizes) {
			const round = rounds.find((r) => r.id === prize.roundId)

			if (!round)
				throw new Error(
					`round with id ${prize.roundId} is not found in rounds`,
				)

			const prizeCurrencyAmount = {
				amount: prize.prizeAmount,
				currency: round.currency,
			}

			lines.push(
				`<a href="${prize.card.imageUrl}">${prize.card.name}</a> — Ticket #${prize.ticketNumber} — ${formatAmountWithUsd(prizeCurrencyAmount)}`,
			)
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openPlay,
			}),
		}
	}
}
