import { PayoutDto, RipDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	formatAmountWithUsd,
	RipStatusGroup,
	sameEvmAddress,
	secondsUntilRipClose,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { bestPull, bestPullLabel } from '../../utils/best-pull'
import { row } from '../../utils/page-row'

const STATUS_LABEL: Record<RipStatusGroup, string> = {
	[RipStatusGroup.FILLING]: '🟢 Filling',
	[RipStatusGroup.COMPLETING]: '⏳ Completing',
	[RipStatusGroup.COMPLETED]: '✅ Completed',
	[RipStatusGroup.REFUNDING]: '↩️ Refunding',
	[RipStatusGroup.REFUNDED]: '↩️ Refunded',
}

interface BaseVariant {
	rip: RipDto
	userAddress: string
}

interface CompletedVariant extends BaseVariant {
	group: RipStatusGroup.COMPLETED
	payouts: PayoutDto[]
}

interface OtherVariant extends BaseVariant {
	group: Exclude<RipStatusGroup, RipStatusGroup.COMPLETED>
}

export type RipDetailVariant = CompletedVariant | OtherVariant

export const RipDetailPage = {
	render(variant: RipDetailVariant): PageContent {
		const { rip } = variant

		const lines: Line[] = [
			fmtHeader(rip),
			...baseLines(variant),
			...variantLines(variant),
		]

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(variant),
		}
	},
}

function fmtHeader(rip: RipDto): FormattedString {
	return FormattedString.b(`🎮 Rip #${rip.id.toString()}`)
}

function baseLines(variant: BaseVariant & { group: RipStatusGroup }): Line[] {
	const { rip } = variant

	return [
		...row('Status', STATUS_LABEL[variant.group]),
		...row('Entry level', formatAmountWithUsd(rip.config.entryPrice)),
		...row('Your entries', userEntries(variant).toString()),
		...row(
			'Total entries',
			`${soldEntries(rip).toString()} / ${rip.config.entryCap.toString()}`,
		),
	]
}

function variantLines(variant: RipDetailVariant): Line[] {
	switch (variant.group) {
		case RipStatusGroup.FILLING:
			return row(
				'Time left',
				toShortDurationFormat(secondsUntilRipClose(variant.rip)),
			)

		case RipStatusGroup.COMPLETING:
			return [
				'',
				FormattedString.i(
					'Your pulls are being prepared. Check back in a moment.',
				),
			]

		case RipStatusGroup.COMPLETED:
			return completedLines(variant)

		case RipStatusGroup.REFUNDING:
			return refundingLines(variant)

		case RipStatusGroup.REFUNDED:
			return refundedLines(variant)
	}
}

function completedLines(variant: CompletedVariant): Line[] {
	const { rip, payouts } = variant

	const revealed = payouts.filter((p) => p.revealed)

	const totalCredited = payouts.reduce(
		(sum, p) => sum + BigInt(p.payoutAmount),
		0n,
	)

	const lines: Line[] = [
		...row('Your pulls', `${revealed.length.toString()} opened`),
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
		lines.push(...row('Best pull', bestPullLabel(best)))
	}

	return lines
}

const REFUND_IN_PROGRESS_SUFFIX = ' — in progress'

function refundingLines(variant: BaseVariant): Line[] {
	const entries = userEntries(variant)

	if (entries === 0) return []

	const { entryPrice } = variant.rip.config

	const expected = BigInt(entries) * BigInt(entryPrice.amount)

	const formatted = formatAmountWithUsd({
		amount: expected.toString(),
		currency: entryPrice.currency,
	})

	return row('Refund', `${formatted}${REFUND_IN_PROGRESS_SUFFIX}`)
}

function refundedLines(variant: BaseVariant): Line[] {
	const { rip } = variant

	const refund = rip.actions.refunds.find((r) =>
		sameEvmAddress(r.userAddress, variant.userAddress),
	)

	if (refund === undefined) return []

	const formatted = formatAmountWithUsd({
		amount: refund.amount,
		currency: rip.config.entryPrice.currency,
	})

	return row('Refund', formatted)
}

function userEntries(variant: BaseVariant): number {
	return variant.rip.actions.purchases
		.filter((p) => sameEvmAddress(p.userAddress, variant.userAddress))
		.reduce((sum, p) => sum + p.entryCount, 0)
}

function soldEntries(rip: RipDto): number {
	return rip.actions.purchases.reduce((sum, p) => sum + p.entryCount, 0)
}

function buildKeyboard(variant: RipDetailVariant): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	const { rip } = variant

	if (variant.group === RipStatusGroup.FILLING) {
		keyboard
			.text(
				'Enter Rip',
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()
	}

	if (variant.group === RipStatusGroup.COMPLETED) {
		keyboard
			.text(
				'View Pulls',
				buildActionData(actionIds.openViewPulls, rip.id),
			)
			.row()
			.text(
				'Enter Again',
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()
	}

	if (variant.group === RipStatusGroup.REFUNDED) {
		keyboard
			.text(
				'Enter Again',
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()
	}

	// TODO: back button — this page can be opened from multiple sources
	return addNav(keyboard, {
		home: actionIds.openHome,
		parent: actionIds.openMyRips,
	})
}
