import {
	AdminWalletResponseDtoOutput,
	GetRipsStateResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
} from '@rips/api-client'
import {
	formatAmountWithUsd,
	formatPercent,
	formatUnits,
	toShortDurationFormat,
} from '@rips/shared'
import { actionIds } from '../actions'
import { EIP155_NAMESPACE } from '../constants'
import { PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'

type StakeEntry = GetRipsStateResponseDtoOutput['availableStakes'][number]
type StakeConfig = NonNullable<StakeEntry['stake']['currentConfig']>
type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

function renderTierTable(table: TierTable): string[] {
	const { currency, defaultFeePercent, tiers } = table

	const lines: string[] = [
		`<b>Referral System</b> (${currency.symbol})`,
		`Default fee: ${formatPercent(defaultFeePercent)}`,
		`Tiers:`,
	]

	for (const tier of tiers) {
		const minVolume = formatUnits(BigInt(tier.minVolume), currency.decimals)
		lines.push(
			`  ≥${minVolume} ${currency.symbol}: ${formatPercent(tier.feePercent)}`,
		)
	}

	return lines
}

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
		`  Cap: ${String(ticketCap)} tickets`,
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
	const lines: string[] = [`<b>Stake #${String(stake.id)}</b>`]

	const roundConfig = fillingRound?.config ?? null
	const nextConfig = stake.currentConfig

	if (fillingRound && roundConfig) {
		const ticketsSold = fillingRound.actions.purchases.reduce(
			(sum, p) => sum + Number(p.ticketCount),
			0,
		)
		lines.push(`Round #${String(fillingRound.id)} [${fillingRound.status}]`)
		lines.push(`Currency: ${fillingRound.currency.symbol}`)
		lines.push(`Tickets sold: ${String(ticketsSold)}`)
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

export const StatePage = {
	render(
		state: GetRipsStateResponseDtoOutput,
		adminWallet: AdminWalletResponseDtoOutput,
		tierTablesRes: GetTierTablesResponseDtoOutput,
	): PageContent {
		const statusLine = state.isPaused
			? '⏸ <b>PAUSED</b>'
			: '▶ <b>RUNNING</b>'

		const evmAddress =
			adminWallet.wallet.namespaceToAddress[EIP155_NAMESPACE] ?? ''
		const balanceDisplay = formatAmountWithUsd(adminWallet.balance)

		const lines: string[] = [
			`<b>Rips State</b>  ${statusLine}`,
			`Admin: <code>${evmAddress}</code>`,
			`Balance: ${balanceDisplay}`,
			`Stakes: ${String(state.availableStakes.length)}`,
			'',
		]

		for (const entry of state.availableStakes) {
			lines.push(...renderStake(entry))
			lines.push('')
		}

		if (state.availableStakes.length === 0) {
			lines.push('No stakes available.')
		}

		const firstTierTable = tierTablesRes.tierTables[0]

		if (firstTierTable) {
			lines.push('')
			lines.push(...renderTierTable(firstTierTable))
		}

		return {
			message: lines.join('\n'),
			keyboard: keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.openState }],
				[{ label: 'Home', actionId: actionIds.openHome }],
			]),
		}
	},
}
