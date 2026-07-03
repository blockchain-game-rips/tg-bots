import { assertFlow, setFlow, toHold } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { resolveSwapPage } from '../../utils/swap'

export const openSwap: ActionDef<void> = noPayload(async (session) => {
	// TODO: mutates then reads its own flow write (via resolveSwapPage). Left
	// mutating in place — refactor once resolveSwapPage returns a transition.
	if (session.flow?.flowType !== 'swap') {
		setFlow(session, 'swap', 'idle', {})
	}

	assertFlow(session, 'swap', 'idle')

	const effect = await resolveSwapPage(session, session.flow.data)

	return { flow: toHold(), effect }
})
