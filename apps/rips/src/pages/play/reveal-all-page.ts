import { PayoutDto, RipDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
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
		const lines = [
			'<b>Open Rips</b>',
			'',
			`🎟 Unrevealed entries: ${unrevealedPayouts.length.toString()}`,
			'',
			'🎁 <b>Your payouts</b>',
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
				`<a href="${payout.card.imageUrl}">${payout.card.name}</a> [${tierName(payout.card.tier)}] — Entry #${payout.entryNumber.toString()} — ${formatAmountWithUsd(payoutCurrencyAmount)}`,
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
