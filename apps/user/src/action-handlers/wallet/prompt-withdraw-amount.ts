import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { toHold } from '../../flows'
import { CustomWithdrawAmountPrompt } from '../../prompts/custom-withdraw-amount-prompt'
import { EffectType } from '../../types'

export const promptWithdrawAmount: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: CustomWithdrawAmountPrompt.render(),
		onSubmit: actionIds.submitWithdrawAmount,
	},
}))
