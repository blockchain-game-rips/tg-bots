import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { actionIds } from '../../grammy-kit/action/actions'
import { CustomSwapAmountPrompt } from '../../prompts/custom-swap-amount-prompt'
import { EffectType } from '../../types'

export const promptSwapAmount: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: CustomSwapAmountPrompt.render(),
	onSubmit: actionIds.submitSwapAmount,
}))
