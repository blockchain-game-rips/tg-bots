import { AvailablePresetDto, CurrencyAmountDto, RipDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	formatAmountWithUsd,
	groupRipStatus,
	resolveConfig,
	RIP_STATUS_LABEL,
	RipStatusGroup,
	secondsUntilRipClose,
	soldEntriesFor,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { addRipDetailsButtons } from '../../utils/rip-details-buttons'

const READY_STATUS_LABEL = 'Ready'
const READY_HINT = 'Starts when first entry is made'

interface ReadyEntry {
	kind: 'ready'
	presetId: number
	entryPrice: CurrencyAmountDto
}

interface RipEntry {
	kind: 'rip'
	rip: RipDto
	entryPrice: CurrencyAmountDto
}

type Entry = ReadyEntry | RipEntry

export interface OngoingRipsPageArgs {
	availablePresets: AvailablePresetDto[]
	ongoingRips: RipDto[]
}

export const OngoingRipsPage = {
	render(args: OngoingRipsPageArgs): PageContent {
		const entries = toEntries(args)

		const lines: Line[] = [fmt`⏳ ${FormattedString.b('Ongoing Rips')}`]

		for (const entry of entries) {
			lines.push('', ...entryLines(entry))
		}

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(entries),
		}
	},
}

// Every preset gets one entry at the top — its filling rip if it has one,
// otherwise a Ready block — so the enterable levels always lead the page in
// price order. Rips that are only settling follow underneath.
function toEntries(args: OngoingRipsPageArgs): Entry[] {
	const presetEntries: Entry[] = args.availablePresets
		.map((availablePreset) => toPresetEntry(availablePreset))
		.sort(byEntryPrice)

	const settlingEntries: Entry[] = args.ongoingRips
		.filter((rip) => groupRipStatus(rip.status) !== RipStatusGroup.FILLING)
		.map(
			(rip): Entry => ({
				kind: 'rip',
				rip,
				entryPrice: rip.config.entryPrice,
			}),
		)
		.sort(byEntryPrice)

	return [...presetEntries, ...settlingEntries]
}

function toPresetEntry(availablePreset: AvailablePresetDto): Entry {
	const { fillingRip } = availablePreset

	if (fillingRip) {
		return {
			kind: 'rip',
			rip: fillingRip,
			entryPrice: fillingRip.config.entryPrice,
		}
	}

	return {
		kind: 'ready',
		presetId: availablePreset.preset.id,
		entryPrice: resolveConfig(availablePreset).entryPrice,
	}
}

function byEntryPrice(a: Entry, b: Entry): number {
	const amountA = BigInt(a.entryPrice.amount)
	const amountB = BigInt(b.entryPrice.amount)

	return amountA < amountB ? -1 : amountA > amountB ? 1 : 0
}

function entryLines(entry: Entry): Line[] {
	return entry.kind === 'ready' ? readyLines(entry) : ripLines(entry.rip)
}

function readyLines(entry: ReadyEntry): Line[] {
	const title = `${formatAmountWithUsd(entry.entryPrice)} Rip`

	return [
		fmt`🎮 ${FormattedString.b(title)}`,
		`Status: ${READY_STATUS_LABEL}`,
		READY_HINT,
	]
}

function ripLines(rip: RipDto): Line[] {
	const group = groupRipStatus(rip.status)

	const lines: Line[] = [
		fmt`🎮 ${FormattedString.b(`Rip #${rip.id.toString()}`)}`,
		`Entry level: ${formatAmountWithUsd(rip.config.entryPrice)}`,
		`Entries: ${soldEntriesFor(rip).toString()} / ${rip.config.entryCap.toString()}`,
		`Status: ${RIP_STATUS_LABEL[group]}`,
	]

	if (group === RipStatusGroup.FILLING) {
		lines.push(
			`Time left: ${toShortDurationFormat(secondsUntilRipClose(rip))}`,
		)
	}

	return lines
}

function buildKeyboard(entries: Entry[]): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	for (const entry of entries) {
		const presetId = enterablePresetId(entry)

		if (presetId === undefined) continue

		const { displayAmount, symbol } = currencyAmountDisplayParts(
			entry.entryPrice,
		)

		keyboard
			.text(
				`🎮 Enter ${displayAmount} ${symbol} Rip`,
				buildActionData(actionIds.openChooseEntryAmount, presetId),
			)
			.row()
	}

	const rips = entries
		.filter((entry) => entry.kind === 'rip')
		.map((entry) => entry.rip)

	addRipDetailsButtons(keyboard, rips)

	return addNav(keyboard, {
		home: actionIds.openHome,
		parent: actionIds.openMyRips,
	})
}

// A rip that is still filling can be joined, so it offers an Enter button
// alongside the presets that have no rip yet.
function enterablePresetId(entry: Entry): number | undefined {
	if (entry.kind === 'ready') return entry.presetId

	return groupRipStatus(entry.rip.status) === RipStatusGroup.FILLING
		? entry.rip.presetId
		: undefined
}
