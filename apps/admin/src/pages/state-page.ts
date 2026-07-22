import {
	AdminWalletResponseDtoOutput,
	GetRipsStateResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
} from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
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

type PresetEntry = GetRipsStateResponseDtoOutput['availablePresets'][number]
type PresetConfig = NonNullable<PresetEntry['preset']['currentConfig']>
type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

function renderTierTable(table: TierTable): Line[] {
	const { currency, defaultFeeBps, tiers } = table

	const lines: Line[] = [
		fmt`${FormattedString.b('Referral System')} (${currency.symbol})`,
		`Default fee: ${formatPercent(defaultFeeBps)}`,
		`Tiers:`,
	]

	for (const tier of tiers) {
		const minVolume = formatUnits(BigInt(tier.minVolume), currency.decimals)
		lines.push(
			`  ≥${minVolume} ${currency.symbol}: ${formatPercent(tier.feeBps)}`,
		)
	}

	return lines
}

function renderConfig(config: PresetConfig): string[] {
	const {
		entryPrice,
		entryCap,
		feeBps,
		durationSeconds,
		payoutDistribution,
	} = config
	const { currency, amount } = entryPrice

	const lines = [
		`  Price: ${formatUnits(BigInt(amount), currency.decimals)} ${currency.symbol}`,
		`  Cap: ${String(entryCap)} entries`,
		`  Fee: ${formatPercent(feeBps)}`,
		`  Duration: ${toShortDurationFormat(durationSeconds)}`,
		`  Payouts:`,
	]

	for (const tier of payoutDistribution) {
		const min = formatUnits(BigInt(tier.minPayout), currency.decimals)
		const max = formatUnits(BigInt(tier.maxPayout), currency.decimals)
		lines.push(`    x${tier.payoutCount}: ${min}–${max} ${currency.symbol}`)
	}

	return lines
}

function renderPreset(entry: PresetEntry): Line[] {
	const { preset, fillingRip } = entry
	const lines: Line[] = [FormattedString.b(`Preset #${String(preset.id)}`)]

	const ripConfig = fillingRip?.config ?? null
	const nextConfig = preset.currentConfig

	if (fillingRip && ripConfig) {
		const entriesSold = fillingRip.actions.purchases.reduce(
			(sum, p) => sum + Number(p.entryCount),
			0,
		)
		lines.push(`Rip #${String(fillingRip.id)} [${fillingRip.status}]`)
		lines.push(`Currency: ${fillingRip.currency.symbol}`)
		lines.push(`Entries sold: ${String(entriesSold)}`)
		lines.push(`Active config:`)
		lines.push(...renderConfig(ripConfig))
	} else {
		lines.push(`No active rip`)
	}

	if (nextConfig) {
		const configsMatch = ripConfig
			? JSON.stringify(ripConfig) === JSON.stringify(nextConfig)
			: false

		if (configsMatch) {
			lines.push(`Next config: same as active`)
		} else {
			lines.push(`Next config (applies after rip):`)
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
			? fmt`⏸ ${FormattedString.b('PAUSED')}`
			: fmt`▶ ${FormattedString.b('RUNNING')}`

		const evmAddress =
			adminWallet.wallet.namespaceToAddress[EIP155_NAMESPACE] ?? ''
		const balanceDisplay = formatAmountWithUsd(adminWallet.balance)

		const lines: Line[] = [
			fmt`${FormattedString.b('Rips State')}  ${statusLine}`,
			fmt`Admin: ${FormattedString.code(evmAddress)}`,
			`Balance: ${balanceDisplay}`,
			`Presets: ${String(state.availablePresets.length)}`,
			'',
		]

		for (const entry of state.availablePresets) {
			lines.push(...renderPreset(entry))
			lines.push('')
		}

		if (state.availablePresets.length === 0) {
			lines.push('No presets available.')
		}

		const firstTierTable = tierTablesRes.tierTables[0]

		if (firstTierTable) {
			lines.push('')
			lines.push(...renderTierTable(firstTierTable))
		}

		return {
			message: joinLines(lines),
			keyboard: keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.openState }],
				[{ label: 'Home', actionId: actionIds.openHome }],
			]),
		}
	},
}
