import { Filter } from 'grammy'
import { Context } from '../types'
import { handleOpenCommand } from './open-command-hanlder/open-command-handler'
import { handleReplyCommand } from './reply-command-handler/reply-command-handler'
import { Command } from './types'

export async function handleButtonCommand(
	command: Command,
	ctx: Filter<Context, 'callback_query:data'>,
) {
	switch (command.type) {
		case 'open':
			return await handleOpenCommand(
				ctx,
				command.pageId,
				command.payloads,
			)

		case 'reply': {
			return await handleReplyCommand(ctx, command.promptId)
		}
	}
}
