import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { AvailableStakeDto, ConfigDto } from '../../generated/api-client'
import { ActionId } from '../actions'
import { KeyboardLayout, NavIds } from '../types'
import { formatUnits } from '../utils/units'

export const COMMAND_SEPARATOR = ':'

export function buildActionData(actionId: ActionId, payload?: string): string {
	if (payload === undefined) return actionId
	return `${actionId}${COMMAND_SEPARATOR}${payload}`
}

export function getConfig(availableStake: AvailableStakeDto) {
	if (availableStake.fillingRound) return availableStake.fillingRound.config
	if (availableStake.stake.currentConfig)
		return availableStake.stake.currentConfig

	throw new Error('Config should be in fillingRound or stake.currentConfig')
}

export function configName(config: ConfigDto): string {
	const { decimals, symbol } = config.ticketPrice.currency

	const formattedAmount = formatUnits(
		BigInt(config.ticketPrice.amount),
		decimals,
	)

	const usd = Number(formattedAmount) * config.ticketPrice.currency.priceUsd

	return `${formattedAmount} ${symbol} $${usd.toFixed(2)}`
}

export function composeMarkup(
	layout: KeyboardLayout,
): InlineKeyboardButton[][] {
	const rows: InlineKeyboardButton[][] = []

	for (const rowOfButtons of layout) {
		const row: InlineKeyboardButton[] = []

		for (const button of rowOfButtons) {
			row.push({
				text: button.label,
				callback_data: buildActionData(button.actionId, button.payload),
			})
		}

		rows.push(row)
	}

	return rows
}

export function addNav(keyboard: InlineKeyboard, ids: NavIds) {
	keyboard.row().text('Back', buildActionData(ids.parent))

	if (ids.home !== ids.parent) {
		keyboard.text('Home', buildActionData(ids.home))
	}

	return keyboard
}
