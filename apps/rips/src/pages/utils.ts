import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { Stake } from '../api/schemas'
import { buildCommand } from '../commands'
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
	return [
		layout.map((button) => {
			return {
				text: button.label,
				callback_data: buildCommand({
					type: 'open',
					pageId: button.pageId,
				}),
			}
		}),
	]
}

export function addNav(keyboard: InlineKeyboard, ids: NavIds) {
	keyboard
		.row()
		.text('Back', buildCommand({ type: 'open', pageId: ids.parent }))

	if (ids.home !== ids.parent) {
		keyboard.text('Home', buildCommand({ type: 'open', pageId: ids.home }))
	}

	return keyboard
}
