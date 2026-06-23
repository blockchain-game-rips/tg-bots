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

type PresetEntry = GetRipsStateResponseDtoOutput['availablePresets'][number]
type PresetConfig = NonNullable<PresetEntry['preset']['currentConfig']>
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

function renderConfig(config: PresetConfig): string[] {
	const {
		entryPrice,
		entryCap,
		feePercent,
		durationSeconds,
		payoutDistribution,
	} = config
	const { currency, amount } = entryPrice

	const lines = [
		`  Price: ${formatUnits(BigInt(amount), currency.decimals)} ${currency.symbol}`,
		`  Cap: ${String(entryCap)} entries`,
		`  Fee: ${formatPercent(feePercent)}`,
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

function renderPreset(entry: PresetEntry): string[] {
	const { preset, fillingRip } = entry
	const lines: string[] = [`<b>Preset #${String(preset.id)}</b>`]

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
			? '⏸ <b>PAUSED</b>'
			: '▶ <b>RUNNING</b>'

		const evmAddress =
			adminWallet.wallet.namespaceToAddress[EIP155_NAMESPACE] ?? ''
		const balanceDisplay = formatAmountWithUsd(adminWallet.balance)

		const lines: string[] = [
			`<b>Rips State</b>  ${statusLine}`,
			`Admin: <code>${evmAddress}</code>`,
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
			message: lines.join('\n'),
			keyboard: keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.openState }],
				[{ label: 'Home', actionId: actionIds.openHome }],
			]),
		}
	},
}
