import { AvailablePresetDto, RipDto } from '@rips/api-client'
import { addNav, joinLines } from '@rips/grammy-kit'
import {
	configName,
	groupRipStatus,
	resolveConfig,
	secondsUntilRipClose,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

function ripLine(rip: RipDto): string {
	const status = groupRipStatus(rip.status)

	if (rip.status !== 'FILLING') {
		return `  Rip #${rip.id.toString()} — ${status}`
	}

	const soldEntries = rip.actions.purchases.reduce(
		(sum, p) => sum + BigInt(p.entryCount),
		0n,
	)
	const remainingEntries = rip.config.entryCap - Number(soldEntries)

	const remaining = secondsUntilRipClose(rip)

	return (
		`  Rip #${rip.id.toString()} — ${status}` +
		` | ${remainingEntries.toString()} entries left` +
		` | ${toShortDurationFormat(remaining)} left`
	)
}

export const OngoingRipsPage = {
	render(
		ongoingRips: RipDto[],
		availablePresets: AvailablePresetDto[],
	): PageContent {
		const presetIds = [...new Set(availablePresets.map((s) => s.preset.id))]

		const lines: string[] = []

		for (const presetId of presetIds) {
			// empty string between presets
			if (lines.length > 0) lines.push('')

			const presetRips = ongoingRips.filter(
				(r) => r.presetId === presetId,
			)

			const preset = availablePresets.find(
				(s) => s.preset.id === presetId,
			)
			if (preset === undefined)
				throw new Error(`Preset ${presetId.toString()} not found`)

			const config = resolveConfig(preset)

			lines.push(`${configName(config)} preset:`)

			const hasActiveRip = presetRips.some((r) => r.status === 'FILLING')

			if (!hasActiveRip) {
				lines.push('  Rip ready — starts with your first purchase')
			}

			for (const rip of presetRips) {
				lines.push(ripLine(rip))
			}
		}

		return {
			message: joinLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openMyRips,
			}),
		}
	},
}
