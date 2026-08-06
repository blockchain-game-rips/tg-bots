import { AvailablePresetDtoOutput, ConfigDtoOutput } from '@rips/api-client'
import { buildActionData, FormattedString, joinLines } from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	resolveConfig,
	secondsUntilRipClose,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const EnterChooseEntryCountPage = {
	render(availablePreset: AvailablePresetDtoOutput): PageContent {
		const config = resolveConfig(availablePreset)

		return {
			message: buildMessage(config, availablePreset),
			keyboard: buildKeyboard(),
		}
	},
}

function buildMessage(
	config: ConfigDtoOutput,
	availablePreset: AvailablePresetDtoOutput,
): FormattedString {
	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(config.entryPrice)

	return joinLines([
		enterBreadcrumb(`${displayAmount} ${symbol}`),
		'',
		'Choose number of entries:',
		'',
		`Entry amount: ${displayAmount} ${symbol} ≈ ${displayUsdAmount}`,
		`Current Rip: ${ripLabel(availablePreset)}`,
		fillStatusLine(config, availablePreset),
	])
}

const REFUND_WARNING = 'refunded if not filled in time'

function fillStatusLine(
	config: ConfigDtoOutput,
	availablePreset: AvailablePresetDtoOutput,
): string {
	if (availablePreset.availability === 'READY')
		return `Fill window: ${toShortDurationFormat(config.durationSeconds)}`

	const timeLeft = toShortDurationFormat(
		secondsUntilRipClose(availablePreset.fillingRip),
	)

	return `Closes in ${timeLeft} — ${REFUND_WARNING}`
}

const RIP_ID_PREFIX = '#'
const NO_FILLING_RIP_LABEL = 'New (starts on entry)'

function ripLabel(availablePreset: AvailablePresetDtoOutput): string {
	if (availablePreset.availability !== 'LIVE') return NO_FILLING_RIP_LABEL

	return `${RIP_ID_PREFIX}${availablePreset.fillingRip.id.toString()}`
}

const QUICK_ENTRY_COUNTS = [1, 3, 8]

function buildKeyboard(): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	for (const count of QUICK_ENTRY_COUNTS)
		keyboard
			.text(
				entryCountLabel(count),
				buildActionData(actionIds.openEnterCheckout, count),
			)
			.row()

	keyboard.text(
		'Custom Amount',
		buildActionData(actionIds.promptEntryCount, undefined),
	)

	return keyboard.appendNavButtons({
		home: actionIds.openHome,
		parent: actionIds.openChoosePreset,
	})
}

function entryCountLabel(count: number): string {
	return count === 1 ? '1 Entry' : `${count.toString()} Entries`
}
