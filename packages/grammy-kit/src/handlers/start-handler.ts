import { CommandContext, Context as GrammyContext, SessionFlavor } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { FlowBase } from '../session/session-utils'
import { ActionId, SessionData } from '../types'
import { EMPTY_PAGE } from './empty-page'
import { User } from 'grammy/types'

type BaseContext = GrammyContext &
	SessionFlavor<SessionData<FlowBase | null>> & { from: User }

type StartContext = CommandContext<BaseContext>

/**
 * Runs the home action through the same pipeline as a button press, so /start
 * commits the session it navigates to. There is no message on screen yet, so
 * the page is sent rather than replacing one.
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
			session: ctx.session,
			actions,
			action: { actionId: homeActionId, payload: ctx.match },
			fallbackPage: EMPTY_PAGE,
		})
	}
}
