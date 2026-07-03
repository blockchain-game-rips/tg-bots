import { toHold } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { CustomSwapAmountPrompt } from '../../prompts/custom-swap-amount-prompt'
import { EffectType } from '../../types'

export const promptSwapAmount: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: CustomSwapAmountPrompt.render(),
		onSubmit: actionIds.submitSwapAmount,
	},
}))
