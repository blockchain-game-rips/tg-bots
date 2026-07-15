import { AvailablePresetDto, ConfigDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	resolveConfig,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'

export const BuyChooseEntryCountPage = {
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
): string {
	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(config.entryPrice)

	return [
		buyEntriesBreadcrumb(`${displayAmount} ${symbol}`),
		'',
		'Choose number of entries:',
		'',
		`Entry amount: ${displayAmount} ${symbol} ≈ ${displayUsdAmount}`,
		`Current Rip: ${ripLabel(availablePreset)}`,
		fillStatusLine(config, availablePreset),
	].join('\n')
}

const REFUND_WARNING = 'refunded if not filled in time'

function fillStatusLine(
	config: ConfigDto,
	availablePreset: AvailablePresetDto,
): string {
	const { fillingRip } = availablePreset

	if (!fillingRip)
		return `Fill window: ${toShortDurationFormat(config.durationSeconds)}`

	const timeLeft = toShortDurationFormat(secondsUntilClose(fillingRip))

	return `Closes in ${timeLeft} — ${REFUND_WARNING}`
}

type FillingRip = NonNullable<AvailablePresetDto['fillingRip']>

const MILLISECONDS_PER_SECOND = 1000

function secondsUntilClose(fillingRip: FillingRip): number {
	const closesAt =
		new Date(fillingRip.startTime).getTime() +
		fillingRip.config.durationSeconds * MILLISECONDS_PER_SECOND

	const secondsLeft = Math.floor(
		(closesAt - Date.now()) / MILLISECONDS_PER_SECOND,
	)

	return Math.max(0, secondsLeft)
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
				buildActionData(actionIds.openBuyCheckout, count),
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
