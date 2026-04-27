import { actionIds } from '../action-ids'
import { testTicketCountPrompt } from '../prompts/test-ticket-count-prompt'
import { Effect, EffectType, SessionData } from '../types'

export async function requestCustomCountAction(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	return Promise.resolve({
		type: EffectType.ASK,
		onSubmit: actionIds.showConfirm,
		prompt: testTicketCountPrompt,
	})
}
