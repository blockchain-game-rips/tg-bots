import { Filter, InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { buildCommand } from '../../commands'
import { Context } from '../../types'
import { KeyboardLayout, NavIds, PageContent } from '../interfaces'

export function getCurrentPage(
	ctx: Filter<Context, 'callback_query:data'>,
): PageContent {
	const rawMarkup = ctx.callbackQuery.message?.reply_markup

	const keyboard =
		rawMarkup && 'inline_keyboard' in rawMarkup
			? InlineKeyboard.from(rawMarkup.inline_keyboard)
			: new InlineKeyboard()

	const message = ctx.callbackQuery.message?.text || ''

	return { message, keyboard }
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
