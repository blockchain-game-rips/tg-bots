import { CurrencyDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { currencyAmountDisplayParts, formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { RevealSummary } from '../../domain/reveal-summary'
import { PageContent } from '../../types'
import { bestPullLabel } from '../../utils/best-pull'
import { row } from '../../utils/page-row'

const TITLE = '🎁 Reveal All Complete'

export interface RevealAllVariant {
	currency: CurrencyDtoOutput
	summary: RevealSummary
}

/**
 * Grouped rows are ETH-only: per-row prices on a long list add noise without
 * adding meaning, and the totals above already anchor the batch's value.
 */
function formatAmountOnly(amount: string, currency: CurrencyDtoOutput): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts({
		amount,
		currency,
	})

	return `${displayAmount} ${symbol}`
}

function bestPullLines(variant: RevealAllVariant): Line[] {
	const { currency, summary } = variant

	if (summary.best === undefined) return []

	return [
		...row('Best pull', bestPullLabel(summary.best)),
		...row(
			'Best payout',
			formatAmountWithUsd({
				amount: summary.best.payoutAmount,
				currency,
			}),
		),
	]
}

function groupedLines(variant: RevealAllVariant): Line[] {
	const { currency, summary } = variant

	const lines: Line[] = ['', FormattedString.b('Grouped results:')]

	for (const group of summary.groups) {
		lines.push('', `${group.tier.emoji} ${group.tier.name}`)

		for (const cardRow of group.rows) {
			const name = FormattedString.a(cardRow.name, cardRow.imageUrl)
			const count =
				cardRow.count > 1 ? ` x${cardRow.count.toString()}` : ''
			const payout = formatAmountOnly(cardRow.totalPayout, currency)

			lines.push(fmt`• ${name}${count}: ${payout}`)
		}
	}

	if (summary.omittedRowCount > 0) {
		lines.push('', `…and ${summary.omittedRowCount.toString()} more`)
	}

	return lines
}

export const RevealAllPage = {
	render(variant: RevealAllVariant): PageContent {
		const { currency, summary } = variant

		const lines: Line[] = [
			FormattedString.b(TITLE),
			...row('Opened', `${summary.openedCount.toString()} pulls`),
			...bestPullLines(variant),
			...row(
				'Total credited',
				formatAmountWithUsd({
					amount: summary.totalCredited,
					currency,
				}),
			),
			...row(
				'Cards',
				joinLines([
					`🆕 New cards: ${summary.newCount.toString()}`,
					`♻️ Duplicates: ${summary.duplicateCount.toString()}`,
				]),
			),
			...groupedLines(variant),
		]

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(),
		}
	},
}

function buildKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			'View Collection',
			buildActionData(actionIds.openCardCollection, undefined),
		)
		.row()
		.text(
			'Enter Again',
			buildActionData(actionIds.openChoosePreset, undefined),
		)
		.row()
		.appendNavButtons()
}
