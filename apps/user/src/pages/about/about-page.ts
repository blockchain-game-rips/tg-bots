import { AvailablePresetDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	configName,
	EntryLevel,
	toEntryLevels,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

const HOW_IT_WORKS_STEPS = [
	'Choose an entry level',
	'Enter a live Rip',
	'When the Rip fills, results are finalized',
	'Open your pulls to reveal payouts and collectible cards',
]

const COMPLIANCE_NOTICE =
	'Referral rewards may be limited or withheld for restricted jurisdictions, abuse, suspicious activity, or Terms violations.'

function entryLevelLines(level: EntryLevel): Line[] {
	const { config } = level

	return [
		fmt`${level.emoji} ${FormattedString.b(level.name)} — ${configName(config)}`,
		`⏱ Fill window: ${toShortDurationFormat(config.durationSeconds)}`,
		`👥 Entries to fill: ${config.entryCap.toString()}`,
	]
}

function buildMessage(levels: EntryLevel[]): FormattedString {
	const howItWorks = HOW_IT_WORKS_STEPS.map(
		(step, index) => `${(index + 1).toString()}. ${step}`,
	)

	const levelBlocks = levels.flatMap((level): Line[] => [
		'',
		...entryLevelLines(level),
	])

	const lines: Line[] = [
		fmt`ℹ️ ${FormattedString.b('About Rips')}`,
		'',
		FormattedString.b('How it works:'),
		...howItWorks,
		'',
		FormattedString.b('Entry levels:'),
		...levelBlocks,
		'',
		'Cards are cosmetic collectibles.',
		'Payouts are credited in ETH.',
		'',
		COMPLIANCE_NOTICE,
	]

	return joinLines(lines)
}

function buildKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			'🎮 Enter Rips',
			buildActionData(actionIds.openChoosePreset, undefined),
		)
		.row()
		.text(
			'🎁 Open Pulls',
			buildActionData(actionIds.openOpenPulls, undefined),
		)
		.appendNavButtons({
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})
}

export const AboutPage = {
	render(availablePresets: AvailablePresetDtoOutput[]): PageContent {
		return {
			message: buildMessage(toEntryLevels(availablePresets)),
			keyboard: buildKeyboard(),
		}
	},
}
