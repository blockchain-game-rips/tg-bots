import { PayoutDto, RipDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { bestPull, bestPullLabel } from '../../utils/best-pull'
import { row } from '../../utils/page-row'
import { tierByIndex } from '../../utils/tiers'

const LOCKED_ROW = '🔒 Not opened yet'

export interface ViewPullsVariant {
	rip: RipDto
	payouts: PayoutDto[]
}

export const ViewPullsPage = {
	render(variant: ViewPullsVariant): PageContent {
		const { rip, payouts } = variant

		const lines: Line[] = [
			FormattedString.b('🎁 Your Pulls'),
			'',
			`Rip #${rip.id.toString()}`,
			...bodyLines(variant),
		]

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(rip, payouts),
		}
	},
}

function bodyLines(variant: ViewPullsVariant): Line[] {
	const { rip, payouts } = variant

	if (payouts.length === 0) {
		return ['', 'You have no pulls in this Rip.']
	}

	const revealed = payouts.filter((payout) => payout.revealed)

	return [
		...summaryLines(rip, payouts, revealed),
		'',
		FormattedString.b('Your pulls:'),
		'',
		...pullLines(rip, payouts),
	]
}

function summaryLines(
	rip: RipDto,
	payouts: PayoutDto[],
	revealed: PayoutDto[],
): Line[] {
	const totalCredited = payouts.reduce(
		(sum, payout) => sum + BigInt(payout.payoutAmount),
		0n,
	)

	const lines: Line[] = [
		...row(
			'Opened',
			`${revealed.length.toString()} / ${payouts.length.toString()} pulls`,
		),
		...row(
			'Total credited',
			formatAmountWithUsd({
				amount: totalCredited.toString(),
				currency: rip.currency,
			}),
		),
	]

	const best = bestPull(revealed)

	if (best !== undefined) {
		lines.push(
			...row(
				'Best pull',
				fmt`${bestPullLabel(best)} — ${payoutAmount(rip, best)}`,
			),
		)
	}

	return lines
}

function pullLines(rip: RipDto, payouts: PayoutDto[]): Line[] {
	return sortForDisplay(payouts).flatMap((payout, index) => {
		const separator: Line[] = index === 0 ? [] : ['']

		return [...separator, ...pullRow(rip, payout)]
	})
}

function pullRow(rip: RipDto, payout: PayoutDto): Line[] {
	if (!payout.revealed) return [LOCKED_ROW]

	const emoji = tierByIndex(payout.card.tier)?.emoji ?? ''
	const name = FormattedString.a(payout.card.name, payout.card.imageUrl)

	return [fmt`${emoji} ${name}`, payoutAmount(rip, payout)]
}

function sortForDisplay(payouts: PayoutDto[]): PayoutDto[] {
	return [...payouts].sort((left, right) => {
		if (left.revealed !== right.revealed) return left.revealed ? -1 : 1

		if (!left.revealed) return 0

		if (left.card.tier !== right.card.tier)
			return right.card.tier - left.card.tier

		return compareAmountsDescending(left.payoutAmount, right.payoutAmount)
	})
}

function compareAmountsDescending(left: string, right: string): number {
	const difference = BigInt(right) - BigInt(left)

	if (difference > 0n) return 1
	if (difference < 0n) return -1

	return 0
}

function payoutAmount(rip: RipDto, payout: PayoutDto): string {
	return formatAmountWithUsd({
		amount: payout.payoutAmount,
		currency: rip.currency,
	})
}

function buildKeyboard(rip: RipDto, payouts: PayoutDto[]): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	const hasUnopenedPulls = payouts.some((payout) => !payout.revealed)

	if (hasUnopenedPulls) {
		// TODO: openOpenPulls is not rip-scoped and resets the flow, so Back
		// from the reveal hub lands on Home instead of returning here.
		keyboard
			.text(
				'🎁 Open Pulls',
				buildActionData(actionIds.openOpenPulls, undefined),
			)
			.row()
	}

	keyboard.text(
		'Enter Again',
		buildActionData(actionIds.openChoosePreset, undefined),
	)

	return addNav(keyboard, {
		home: actionIds.openHome,
		parent: actionIds.openRipStatus,
		parentPayload: rip.id,
	})
}
