import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { Stake } from '../api/schemas'
import { buildCommand } from '../button-handler/utils'
import { KeyboardLayout, NavIds } from '../types'
import { formatUnits } from '../utils/units'

export function readableStake(stake: Stake): string {
	const { decimals, symbol } = stake.ticketPrice.currency

	const price = formatUnits(BigInt(stake.ticketPrice.amount), decimals)

	return `${price} ${symbol}`
}

export function composeMarkup(
	layout: KeyboardLayout,
): InlineKeyboardButton[][] {
	const rows: InlineKeyboardButton[][] = []
	let current: InlineKeyboardButton[] = []

	for (const button of layout) {
		if (button === 'row') {
			if (current.length > 0) rows.push(current)
			current = []
		} else {
			current.push({
				text: button.label,
				callback_data: buildCommand({
					type: 'open',
					pageId: button.pageId,
					payloads: [],
				}),
			})
		}
	}

	if (current.length > 0) rows.push(current)

	return rows
}

export function addNav(keyboard: InlineKeyboard, ids: NavIds) {
	keyboard
		.row()
		.text(
			'Back',
			buildCommand({ type: 'open', pageId: ids.parent, payloads: [] }),
		)

	if (ids.home !== ids.parent) {
		keyboard.text(
			'Home',
			buildCommand({ type: 'open', pageId: ids.home, payloads: [] }),
		)
	}

	return keyboard
}
