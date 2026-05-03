import { actionIds } from '../../actions'
import { CustomSwapAmountPrompt } from '../../prompts/custom-swap-amount-prompt'
import { Effect, EffectType, SessionData } from '../../types'

export function askSwapAmount(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.ASK,
		prompt: CustomSwapAmountPrompt.render(),
		onSubmit: actionIds.showSwapAmountChosen,
	}
}
