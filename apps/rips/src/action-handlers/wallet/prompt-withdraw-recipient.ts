import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { actionIds } from '../../grammy-kit/action/actions'
import { WithdrawAddressPrompt } from '../../prompts/withdraw-address-prompt'
import { EffectType } from '../../types'

export const promptWithdrawRecipient: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: WithdrawAddressPrompt.render(),
	onSubmit: actionIds.submitWithdrawRecipient,
}))
