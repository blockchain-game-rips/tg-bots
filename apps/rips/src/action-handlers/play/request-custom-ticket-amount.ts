import { actionIds } from '../../actions'
import { CustomTicketAmountPrompt } from '../../prompts/custom-ticket-amount-prompt'
import { Effect, EffectType, SessionData } from '../../types'

export function requestCustomTicketAmount(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.ASK,
		prompt: CustomTicketAmountPrompt.render(),
		onSubmit: actionIds.showConfirmPurchase,
	}
}
