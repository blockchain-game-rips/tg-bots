import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { CustomSwapAmountPrompt } from '../../prompts/custom-swap-amount-prompt'
import { EffectType } from '../../types'

export const promptSwapAmount: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: CustomSwapAmountPrompt.render(),
	onSubmit: actionIds.submitSwapAmount,
}))
