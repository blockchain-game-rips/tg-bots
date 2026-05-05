import { GetRipsStateResponseDtoOutput } from '../../generated/api-client'
import { PageContent } from '../types'
import { actionIds } from '../actions'
import { formatUnits } from '../utils/currency'
import { toShortDurationFormat } from '../utils/duration'
import { keyboardFromLayout } from '../utils/keyboard'
import { formatPercent } from '../utils/referral'

type StakeEntry = GetRipsStateResponseDtoOutput['availableStakes'][number]
type StakeConfig = NonNullable<StakeEntry['stake']['currentConfig']>

function renderConfig(config: StakeConfig): string[] {
	const {
		ticketPrice,
		ticketCap,
		feePercent,
		durationSeconds,
		prizeDistribution,
	} = config
	const { currency, amount } = ticketPrice

	const lines = [
		`  Price: ${formatUnits(BigInt(amount), currency.decimals)} ${currency.symbol}`,
		`  Cap: ${ticketCap} tickets`,
		`  Fee: ${formatPercent(feePercent)}`,
		`  Duration: ${toShortDurationFormat(durationSeconds)}`,
		`  Prizes:`,
	]

	for (const tier of prizeDistribution) {
		const min = formatUnits(BigInt(tier.minPrize), currency.decimals)
		const max = formatUnits(BigInt(tier.maxPrize), currency.decimals)
		lines.push(`    x${tier.prizeCount}: ${min}–${max} ${currency.symbol}`)
	}

	return lines
}

function renderStake(entry: StakeEntry): string[] {
	const { stake, fillingRound } = entry
	const lines: string[] = [`<b>Stake #${stake.id}</b>`]

	const roundConfig = fillingRound?.config ?? null
	const nextConfig = stake.currentConfig

	if (fillingRound && roundConfig) {
		const ticketsSold = fillingRound.actions.purchases.reduce(
			(sum, p) => sum + Number(p.ticketCount),
			0,
		)
		lines.push(`Round #${fillingRound.id} [${fillingRound.status}]`)
		lines.push(`Currency: ${fillingRound.currency.symbol}`)
		lines.push(`Tickets sold: ${ticketsSold}`)
		lines.push(`Active config:`)
		lines.push(...renderConfig(roundConfig))
	} else {
		lines.push(`No active round`)
	}

	if (nextConfig) {
		const configsMatch = roundConfig
			? JSON.stringify(roundConfig) === JSON.stringify(nextConfig)
			: false

		if (configsMatch) {
			lines.push(`Next config: same as active`)
		} else {
			lines.push(`Next config (applies after round):`)
			lines.push(...renderConfig(nextConfig))
		}
	} else {
		lines.push(`Next config: none set`)
	}

	return lines
}

export class HomePage {
	static render(state: GetRipsStateResponseDtoOutput): PageContent {
		const statusLine = state.isPaused
			? '⏸ <b>PAUSED</b>'
			: '▶ <b>RUNNING</b>'

		const lines: string[] = [
			`<b>Rips Admin</b>  ${statusLine}`,
			`Stakes: ${state.availableStakes.length}`,
			'',
		]

		for (const entry of state.availableStakes) {
			lines.push(...renderStake(entry))
			lines.push('')
		}

		if (state.availableStakes.length === 0) {
			lines.push('No stakes available.')
		}

		return {
			message: lines.join('\n'),
			keyboard: keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.openHome }],
			]),
		}
	}
}
