import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	PrizeDto,
	RoundDto,
} from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export const REVEAL_ONE_PAYLOAD = 'one'
export const REVEAL_ALL_PAYLOAD = 'all'

export class RevealPrizesPage {
	/**
	 * Page allows to reveal prizes and in the same time shows previos reveal if it was
	 * @param unrevealedPrizes available to reveal prizes
	 * @param revealedPrizes previos reveal from the same page
	 */
	static render(
		rounds: RoundDto[],
		unrevealedPrizes: PrizeDto[],
		revealedPrizes: PrizeDto[] = [],
	): PageContent {
		const lines: string[] = []

		if (revealedPrizes.length > 0) {
			lines.push('Your prizes:')

			for (const prize of revealedPrizes) {
				const round = rounds.find((round) => prize.roundId === round.id)

				if (!round)
					throw new Error(
						`round with id ${prize.roundId} is not found in rounds`,
					)

				const prizeCurrencyAmount: CurrencyAmountDto = {
					amount: prize.prizeAmount,
					currency: round.currency,
				}

				const prizeAmount = BigInt(prize.prizeAmount)
				const formattedPrizeAmount = formatUnits(prizeAmount, 18)

				lines.push(
					`Ticket #${prize.ticketNumber} — ${formattedPrizeAmount} ETH ${toUsd(prizeCurrencyAmount)}`,
				)
			}

			lines.push('')
		}

		lines.push(`Unrevealed tickets: ${unrevealedPrizes.length}`)

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildCommand({
						type: 'open',
						pageId: pageIds.revealPrizes,
						payloads: [REVEAL_ONE_PAYLOAD],
					}),
				)
				.row()
				.text(
					'Reveal all',
					buildCommand({
						type: 'open',
						pageId: pageIds.revealPrizes,
						payloads: [REVEAL_ALL_PAYLOAD],
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
