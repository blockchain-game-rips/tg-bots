import { CommandContext, Context as GrammyContext, SessionFlavor } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { openWorkspace } from '../session/workspaces'
import { ActionId, SessionData } from '../types'
import { EMPTY_PAGE } from './empty-page'
import { User } from 'grammy/types'

type BaseContext = GrammyContext & SessionFlavor<SessionData> & { from: User }

type StartContext = CommandContext<BaseContext>

/**
 * Runs the home action through the same pipeline as a button press, so /start
 * commits the workspace it navigates to. There is no message on screen yet, so
 * the page is sent rather than replacing one, and the workspace opened here
 * claims that message once it lands.
 *
 * This is the only gesture that opens a workspace — every button press edits a
 * message that already has one — so it is also what evicts the coldest
 * workspace when the chat is full.
 *
 * The deep-link argument of `/start` is forwarded verbatim, leaving the home
 * action's own codec to decide what it means.
 */
export function createStartHandler(
	actions: Record<string, BoundAction | undefined>,
	homeActionId: ActionId<unknown>,
): (ctx: StartContext) => Promise<void> {
	return async function handleStart(ctx: StartContext): Promise<void> {
		await executeEffectOrDisplayError({
			api: ctx.api,
			chatId: ctx.chat.id,
			telegramId: ctx.from.id,
			message: null,
			workspace: openWorkspace(ctx.session),
			actions,
			action: { actionId: homeActionId, payload: ctx.match },
			fallbackPage: EMPTY_PAGE,
		})
	}
}
