import { addNav } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/format/currency'
import { tierName } from '../../utils/tiers'

export const RevealAllPage = {
	render(
		rounds: RoundDto[],
		revealedPrizes: PrizeDto[],
		unrevealedPrizes: PrizeDto[],
	): PageContent {
		const lines = [
			'<b>Open Rips</b>',
			'',
			`🎟 Unrevealed tickets: ${unrevealedPrizes.length.toString()}`,
			'',
			'🎁 <b>Your prizes</b>',
			'',
		]

		for (const prize of revealedPrizes) {
			const round = rounds.find((r) => r.id === prize.roundId)

			if (!round)
				throw new Error(
					`round with id ${prize.roundId.toString()} is not found in rounds`,
				)

			const prizeCurrencyAmount = {
				amount: prize.prizeAmount,
				currency: round.currency,
			}

			lines.push(
				`<a href="${prize.card.imageUrl}">${prize.card.name}</a> [${tierName(prize.card.tier)}] — Ticket #${prize.ticketNumber.toString()} — ${formatAmountWithUsd(prizeCurrencyAmount)}`,
			)
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openPlay,
			}),
		}
	},
}
