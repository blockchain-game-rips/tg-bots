import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { tierName } from '../../utils/tiers'

export const RevealSinglePage = {
	render(
		round: RoundDto,
		revealedPrize: PrizeDto,
		unrevealedPrizes: PrizeDto[],
	): PageContent {
		const prizeCurrencyAmount = {
			amount: revealedPrize.prizeAmount,
			currency: round.currency,
		}

		const lines = [
			'<b>Open Rips</b>',
			'',
			`🎁 <a href="${revealedPrize.card.imageUrl}">${revealedPrize.card.name}</a> [${tierName(revealedPrize.card.tier)}]`,
			`Ticket #${revealedPrize.ticketNumber.toString()} — ${formatAmountWithUsd(prizeCurrencyAmount)}`,
			'',
			`🎟 Unrevealed tickets: ${unrevealedPrizes.length.toString()}`,
		]

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
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
				parent: actionIds.openPlay,
			}),
		}
	},
}
