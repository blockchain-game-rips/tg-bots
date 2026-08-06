import { AvailablePresetDtoOutput } from '@rips/api-client'
import { buildActionData, fmt, FormattedString, Line } from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	EntryLevel,
	formatAmountWithUsd,
	toEntryLevels,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const EnterChoosePresetPage = {
	render(availablePresets: AvailablePresetDtoOutput[]): PageContent {
		const levels = toEntryLevels(availablePresets)

		return {
			message: buildMessage(levels),
			keyboard: buildKeyboard(levels),
		}
	},
}

function buildMessage(levels: EntryLevel[]): FormattedString {
	const header: Line[] = [enterBreadcrumb(), '', 'Choose your entry level:']

	const levelLines = levels.flatMap((level): Line[] => [
		'',
		fmt`${level.emoji} ${FormattedString.b(level.name)}`,
		formatAmountWithUsd(level.config.entryPrice),
	])

	return FormattedString.join([...header, ...levelLines], '\n')
}

function buildKeyboard(levels: EntryLevel[]): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	for (const level of levels) {
		const { displayAmount, symbol } = currencyAmountDisplayParts(
			level.config.entryPrice,
		)

		keyboard
			.text(
				`${level.emoji} ${displayAmount} ${symbol}`,
				buildActionData(
					actionIds.openChooseEntryAmount,
					level.presetId,
				),
			)
			.row()
	}

	return keyboard.appendNavButtons({
		home: actionIds.openHome,
		parent: actionIds.openHome,
	})
}
