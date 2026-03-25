import { InlineKeyboard } from 'grammy'
import { PrizeTier, Stake } from '../../api/schemas'
import { PageContent } from '../../types'
import { formatUnits, formatUsd } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

function formatDuration(seconds: number): string {
	const SECONDS_PER_MINUTE = 60
	const SECONDS_PER_HOUR = 3600
	const SECONDS_PER_DAY = 86400

	if (seconds >= SECONDS_PER_DAY && seconds % SECONDS_PER_DAY === 0) {
		const days = seconds / SECONDS_PER_DAY
		return `${days}d`
	}

	if (seconds >= SECONDS_PER_HOUR && seconds % SECONDS_PER_HOUR === 0) {
		const hours = seconds / SECONDS_PER_HOUR
		return `${hours}h`
	}

	if (seconds >= SECONDS_PER_MINUTE && seconds % SECONDS_PER_MINUTE === 0) {
		const minutes = seconds / SECONDS_PER_MINUTE
		return `${minutes}m`
	}

	return `${seconds}s`
}

function formatPrizeTier(
	tier: PrizeTier,
	decimals: number,
	symbol: string,
	ethPrice: number,
): string {
	const min = formatUnits(BigInt(tier.minPrize), decimals)
	const max = formatUnits(BigInt(tier.maxPrize), decimals)

	const prizeRange =
		min === max
			? `${min} ${symbol} ${formatUsd(min, ethPrice)}`
			: `${min}–${max} ${symbol} ${formatUsd(max, ethPrice)}`

	return `  • ${tier.prizeCount} × ${prizeRange}`
}

function renderStakeConfig(stake: Stake, ethPrice: number): string {
	const { decimals, symbol } = stake.ticketPrice.currency
	const ticketPrice = formatUnits(BigInt(stake.ticketPrice.amount), decimals)

	const tierLines = stake.prizeDistribution.map((tier) =>
		formatPrizeTier(tier, decimals, symbol, ethPrice),
	)

	return [
		`<b>${readableStake(stake)} ${formatUsd(ticketPrice, ethPrice)} stake</b>`,
		`Duration: ${formatDuration(stake.durationSeconds)}`,
		`Tickets per round: ${stake.ticketCup}`,
		'Prizes:',
		...tierLines,
	].join('\n')
}

export class AboutPage {
	static render(stakes: Stake[], ethPrice: number): PageContent {
		const sections = stakes.map((stake) =>
			renderStakeConfig(stake, ethPrice),
		)

		const message = sections.join('\n\n')

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.home,
			}),
		}
	}
}
