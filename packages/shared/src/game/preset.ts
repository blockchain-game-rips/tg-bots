import { AvailablePresetDtoOutput, ConfigDtoOutput } from '@rips/api-client'
import { formatUnits } from '../format/units'

export function resolveConfig(availablePreset: AvailablePresetDtoOutput) {
	if (availablePreset.availability === 'LIVE')
		return availablePreset.fillingRip.config

	return availablePreset.preset.currentConfig
}

export function configName(config: ConfigDtoOutput): string {
	const { decimals, symbol } = config.entryPrice.currency

	const formattedAmount = formatUnits(
		BigInt(config.entryPrice.amount),
		decimals,
	)

	const usd = Number(formattedAmount) * config.entryPrice.currency.priceUsd

	return `${formattedAmount} ${symbol} $${usd.toFixed(2)}`
}
