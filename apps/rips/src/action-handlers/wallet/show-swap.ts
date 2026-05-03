import { Effect, SessionData } from '../../types'
import { assertFlow, setFlow } from '../../utils/session-utils'
import { resolveSwapPage } from '../../utils/swap'

export async function showSwap(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	if (session.flow?.flowType !== 'swap') {
		setFlow(session, 'swap', 'idle', {})
	}

	assertFlow(session, 'swap', 'idle')

	return resolveSwapPage(session, session.flow.data)
}
