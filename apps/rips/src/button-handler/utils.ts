import { Filter, InlineKeyboard } from 'grammy'
import { Context, PageContent } from '../types'
import { Command } from './types'

const COMMAND_SEPARATOR = ':'

export function buildCommand(command: Command): string {
	let commandStr = ''

	switch (command.type) {
		case 'open':
			commandStr = `o${COMMAND_SEPARATOR}${command.pageId}`

			for (const payload of command.payloads || []) {
				commandStr += `${COMMAND_SEPARATOR}${payload}`
			}

			break

		case 'reply':
			commandStr = `r${COMMAND_SEPARATOR}${command.promptId}`
	}

	return commandStr
}

export function parseCommand(data: string): Command {
	const [prefix, ...payloads] = data.split(COMMAND_SEPARATOR)

	switch (prefix) {
		case 'o':
			return {
				type: 'open',
				pageId: payloads[0],
				payloads: payloads.slice(1) || [],
			}

		case 'r':
			return {
				type: 'reply',
				promptId: payloads[0],
			}

		default:
			throw new Error(`Unknown command prefix: ${prefix}`)
	}
}

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
