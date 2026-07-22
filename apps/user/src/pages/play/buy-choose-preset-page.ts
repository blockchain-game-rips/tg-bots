import { AvailablePresetDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	fmt,
	FormattedString,
	Line,
} from '@rips/grammy-kit'
import { currencyAmountDisplayParts, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

interface PresetLevel {
	presetId: number
	emoji: string
	name: string
	displayAmount: string
	symbol: string
	displayUsdAmount: string
}

export const BuyChoosePresetPage = {
	render(availablePresets: AvailablePresetDto[]): PageContent {
		const levels = toLevels(availablePresets)

		return {
			message: buildMessage(levels),
			keyboard: buildKeyboard(levels),
		}
	},
}

function toLevels(availablePresets: AvailablePresetDto[]): PresetLevel[] {
	return [...availablePresets].sort(byEntryPrice).map(toPresetLevel)
}

function byEntryPrice(a: AvailablePresetDto, b: AvailablePresetDto): number {
	const amountA = BigInt(resolveConfig(a).entryPrice.amount)
	const amountB = BigInt(resolveConfig(b).entryPrice.amount)

	return amountA < amountB ? -1 : amountA > amountB ? 1 : 0
}

const LEVELS = [
	{ emoji: '🎮', name: 'Small Rip' },
	{ emoji: '🎮', name: 'Medium Rip' },
	{ emoji: '🔥', name: 'Standard Rip' },
]

const DEFAULT_LEVEL = { emoji: '🔥', name: 'Rip' }

function toPresetLevel(
	availablePreset: AvailablePresetDto,
	index: number,
): PresetLevel {
	const { emoji, name } = LEVELS[index] ?? DEFAULT_LEVEL

	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(resolveConfig(availablePreset).entryPrice)

	return {
		presetId: availablePreset.preset.id,
		emoji,
		name,
		displayAmount,
		symbol,
		displayUsdAmount,
	}
}

function buildMessage(levels: PresetLevel[]): FormattedString {
	const header: Line[] = [
		FormattedString.b('🎮 Enter Rip'),
		'',
		'Choose your entry level:',
	]

	const levelLines = levels.flatMap((level): Line[] => [
		'',
		fmt`${level.emoji} ${FormattedString.b(level.name)}`,
		`${level.displayAmount} ${level.symbol} ≈ ${level.displayUsdAmount}`,
	])

	return FormattedString.join([...header, ...levelLines], '\n')
}

function buildKeyboard(levels: PresetLevel[]): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	for (const level of levels) {
		keyboard
			.text(
				`${level.emoji} ${level.displayAmount} ${level.symbol}`,
				buildActionData(
					actionIds.openChooseEntryAmount,
					level.presetId,
				),
			)
			.row()
	}

	return addNav(keyboard, {
		home: actionIds.openHome,
		parent: actionIds.openHome,
	})
}
