import { AvailablePresetDto, ConfigDto } from '@rips/api-client'
import { formatUnits } from '../format/units'

export function resolveConfig(availablePreset: AvailablePresetDto) {
	if (availablePreset.fillingRip) return availablePreset.fillingRip.config
	if (availablePreset.preset.currentConfig)
		return availablePreset.preset.currentConfig

	throw new Error('Config should be in fillingRip or preset.currentConfig')
}

export function configName(config: ConfigDto): string {
	const { decimals, symbol } = config.entryPrice.currency

	const formattedAmount = formatUnits(
		BigInt(config.entryPrice.amount),
		decimals,
	)

	const usd = Number(formattedAmount) * config.entryPrice.currency.priceUsd

	return `${formattedAmount} ${symbol} $${usd.toFixed(2)}`
}
