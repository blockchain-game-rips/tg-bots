import { InlineKeyboard } from 'grammy'
import { PrizeTier, Stake } from '../../api/schemas'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
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
): string {
	const min = formatUnits(BigInt(tier.minPrize), decimals)
	const max = formatUnits(BigInt(tier.maxPrize), decimals)

	const prizeRange =
		min === max ? `${min} ${symbol}` : `${min}–${max} ${symbol}`

	return `  • ${tier.prizeCount} × ${prizeRange}`
}

function renderStakeConfig(stake: Stake): string {
	const { decimals, symbol } = stake.ticketPrice.currency

	const tierLines = stake.prizeDistribution.map((tier) =>
		formatPrizeTier(tier, decimals, symbol),
	)

	return [
		`<b>Stake: ${readableStake(stake)}</b>`,
		`Duration: ${formatDuration(stake.durationSeconds)}`,
		`Ticket cap: ${stake.ticketCup}`,
		'Prize distribution:',
		...tierLines,
	].join('\n')
}

export class AboutPage {
	static render(stakes: Stake[]): PageContent {
		const sections = stakes.map(renderStakeConfig)

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
