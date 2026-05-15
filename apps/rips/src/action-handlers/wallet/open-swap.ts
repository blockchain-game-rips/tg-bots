import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { assertFlow, setFlow } from '../../grammy-kit/session/session-utils'
import { resolveSwapPage } from '../../utils/swap'

export const openSwap: ActionDef<void> = noPayload(async (session) => {
	if (session.flow?.flowType !== 'swap') {
		setFlow(session, 'swap', 'idle', {})
	}

	assertFlow(session, 'swap', 'idle')

	return resolveSwapPage(session, session.flow.data)
})
