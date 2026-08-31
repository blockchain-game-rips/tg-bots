import { ActionDef, noPayload } from '../../../action-def'
import { actionIds } from '../../../action-ids'
import { toHold } from '../../../flows'
import { CustomSwapAmountPrompt } from '../../../prompts/custom-swap-amount-prompt'
import { EffectType } from '../../../types'

export const promptSwapAmount: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: CustomSwapAmountPrompt.render(),
		onSubmit: actionIds.openSwapCheckoutFromAmount,
	},
}))
