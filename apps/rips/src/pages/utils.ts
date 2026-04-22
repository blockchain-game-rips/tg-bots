import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { AvailableStakeDto, ConfigDto } from '../../generated/api-client'
import { buildCommand } from '../button-handler/utils'
import { KeyboardLayout, NavIds } from '../types'
import { formatUnits } from '../utils/units'

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
