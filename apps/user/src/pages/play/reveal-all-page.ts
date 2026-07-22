import { PayoutDto, RipDto } from '@rips/api-client'
import { addNav, fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { tierName } from '../../utils/tiers'

export const RevealAllPage = {
	render(
		rips: RipDto[],
		revealedPayouts: PayoutDto[],
		unrevealedPayouts: PayoutDto[],
	): PageContent {
		const lines: Line[] = [
			FormattedString.b('Open Rips'),
			'',
			`🎟 Unrevealed entries: ${unrevealedPayouts.length.toString()}`,
			'',
			fmt`🎁 ${FormattedString.b('Your payouts')}`,
			'',
		]

		for (const payout of revealedPayouts) {
			const rip = rips.find((r) => r.id === payout.ripId)

			if (!rip)
				throw new Error(
					`rip with id ${payout.ripId.toString()} is not found in rips`,
				)

			const payoutCurrencyAmount = {
				amount: payout.payoutAmount,
				currency: rip.currency,
			}

			lines.push(
				fmt`${FormattedString.a(payout.card.name, payout.card.imageUrl)} [${tierName(payout.card.tier)}] — Entry #${payout.entryNumber.toString()} — ${formatAmountWithUsd(payoutCurrencyAmount)}`,
			)
		}

		return {
			message: joinLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	},
}
