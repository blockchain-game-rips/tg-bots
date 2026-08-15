import { BoundAction } from '../action/actions'
import { Navigation, resolveNavigation } from '../session/history'
import { toHold } from '../session/session-utils'
import {
	ActionData,
	AnyHandlerResult,
	EffectType,
	HistoryEntry,
	SessionData,
} from '../types'
import { ErrorToRender } from './error-to-render'

const STALE_MENU_MESSAGE =
	'This menu is out of date. Send /start for a fresh one.'

const NO_HISTORY_MESSAGE = 'Nothing to go back to'

export async function resolveActionEffect(
	session: SessionData,
	actions: Record<string, BoundAction | undefined>,
	action: ActionData,
): Promise<AnyHandlerResult> {
	const entry = entryToRender(resolveNavigation(session, action))

	// a page entry has no handler to re-run, so it is replayed as it was rendered
	if (entry.kind === 'page') {
		return {
			flow: toHold(),
			effect: { type: EffectType.NAVIGATE, page: entry.page },
		}
	}

	const boundAction = actions[entry.action.actionId]

	if (boundAction === undefined) throw new ErrorToRender(STALE_MENU_MESSAGE)

	const { payload } = entry.action

	return await boundAction.handler(
		session,
		payload !== undefined ? boundAction.decode(payload) : undefined,
	)
}

function entryToRender(navigation: Navigation): HistoryEntry {
	switch (navigation.kind) {
		case 'forward':
			return { kind: 'action', action: navigation.action }

		case 'back':
			return navigation.to

		case 'at-root':
			throw new ErrorToRender(NO_HISTORY_MESSAGE)
	}
}
