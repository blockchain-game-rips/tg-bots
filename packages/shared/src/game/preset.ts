import { AvailablePresetDtoOutput, ConfigDtoOutput } from '@rips/api-client'
import { formatAmountWithUsd } from '../currency'

export function resolveConfig(
	availablePreset: AvailablePresetDtoOutput,
): ConfigDtoOutput {
	if (availablePreset.availability === 'LIVE')
		return availablePreset.fillingRip.config

	return availablePreset.preset.currentConfig
}

export function configName(config: ConfigDtoOutput): string {
	return formatAmountWithUsd(config.entryPrice)
}

export interface EntryLevel {
	presetId: number
	emoji: string
	name: string
	config: ConfigDtoOutput
}

const LEVEL_NAMES = [
	{ emoji: '🎮', name: 'Small Rip' },
	{ emoji: '🎮', name: 'Medium Rip' },
	{ emoji: '🔥', name: 'Standard Rip' },
]

const FALLBACK_LEVEL_NAME = { emoji: '🔥', name: 'Rip' }

function byEntryPrice(
	a: AvailablePresetDtoOutput,
	b: AvailablePresetDtoOutput,
): number {
	const amountA = BigInt(resolveConfig(a).entryPrice.amount)
	const amountB = BigInt(resolveConfig(b).entryPrice.amount)

	return amountA < amountB ? -1 : amountA > amountB ? 1 : 0
}

export function toEntryLevels(
	availablePresets: AvailablePresetDtoOutput[],
): EntryLevel[] {
	return [...availablePresets]
		.sort(byEntryPrice)
		.map((availablePreset, index) => {
			const { emoji, name } = LEVEL_NAMES[index] ?? FALLBACK_LEVEL_NAME

			return {
				presetId: availablePreset.preset.id,
				emoji,
				name,
				config: resolveConfig(availablePreset),
			}
		})
}
