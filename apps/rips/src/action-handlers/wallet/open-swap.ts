import { ActionDef, noPayload } from '../../action-def'
import { assertFlow, setFlow } from '../../utils/session-utils'
import { resolveSwapPage } from '../../utils/swap'

export const openSwap: ActionDef<void> = noPayload(async (session) => {
	if (session.flow?.flowType !== 'swap') {
		setFlow(session, 'swap', 'idle', {})
	}

	assertFlow(session, 'swap', 'idle')

	return resolveSwapPage(session, session.flow.data)
})
