import { AvailablePresetDto, ConfigDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	FormattedString,
	joinLines,
} from '@rips/grammy-kit'
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
	render(availablePreset: AvailablePresetDto): PageContent {
		const config = resolveConfig(availablePreset)

		return {
			message: buildMessage(config, availablePreset),
			keyboard: buildKeyboard(),
		}
	},
}

function buildMessage(
	config: ConfigDto,
	availablePreset: AvailablePresetDto,
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
	config: ConfigDto,
	availablePreset: AvailablePresetDto,
): string {
	const { fillingRip } = availablePreset

	if (!fillingRip)
		return `Fill window: ${toShortDurationFormat(config.durationSeconds)}`

	const timeLeft = toShortDurationFormat(secondsUntilRipClose(fillingRip))

	return `Closes in ${timeLeft} — ${REFUND_WARNING}`
}

const RIP_ID_PREFIX = '#'
const NO_FILLING_RIP_LABEL = 'New (starts on entry)'

function ripLabel(availablePreset: AvailablePresetDto): string {
	const { fillingRip } = availablePreset

	if (!fillingRip) return NO_FILLING_RIP_LABEL

	return `${RIP_ID_PREFIX}${fillingRip.id.toString()}`
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

	return addNav(keyboard, {
		home: actionIds.openHome,
		parent: actionIds.openChoosePreset,
	})
}

function entryCountLabel(count: number): string {
	return count === 1 ? '1 Entry' : `${count.toString()} Entries`
}
