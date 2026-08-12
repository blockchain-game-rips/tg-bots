import { CommandContext, Context as GrammyContext, SessionFlavor } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { FlowBase } from '../session/session-utils'
import { ActionId, SessionData } from '../types'
import { EMPTY_PAGE } from './empty-page'

type BaseContext = GrammyContext & SessionFlavor<SessionData<FlowBase | null>>

type StartContext = CommandContext<BaseContext>

/**
 * Runs the home action through the same pipeline as a button press, so /start
 * commits the session it navigates to. There is no message on screen yet, so
 * the page is sent rather than replacing one.
 */
export function createStartHandler(
	actions: Record<string, BoundAction | undefined>,
	homeActionId: ActionId,
): (ctx: StartContext) => Promise<void> {
	return async function handleStart(ctx: StartContext): Promise<void> {
		await executeEffectOrDisplayError(
			ctx.api,
			ctx.chat.id,
			null,
			ctx.session,
			actions,
			{ actionId: homeActionId, payload: undefined },
			EMPTY_PAGE,
		)
	}
}
