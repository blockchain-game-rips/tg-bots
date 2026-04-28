import { actionIds } from '../actions'
import { CustomWithdrawAmountPrompt } from '../prompts/custom-withdraw-amount-prompt'
import { Effect, EffectType, SessionData } from '../types'

export function requestWithdrawCustomAmount(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.ASK,
		prompt: CustomWithdrawAmountPrompt.render(),
		onSubmit: actionIds.submitWithdrawAmount,
	}
}
