import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { actionIds } from '../../grammy-kit/action/actions'
import { CustomWithdrawAmountPrompt } from '../../prompts/custom-withdraw-amount-prompt'
import { EffectType } from '../../types'

export const promptWithdrawAmount: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: CustomWithdrawAmountPrompt.render(),
	onSubmit: actionIds.submitWithdrawAmount,
}))
