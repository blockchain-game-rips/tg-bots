import { actionIds } from '../../actions'
import { WithdrawAddressPrompt } from '../../prompts/withdraw-address-prompt'
import { Effect, EffectType, SessionData } from '../../types'

export function requestWithdrawRecipient(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.ASK,
		prompt: WithdrawAddressPrompt.render(),
		onSubmit: actionIds.submitWithdrawRecipient,
	}
}
