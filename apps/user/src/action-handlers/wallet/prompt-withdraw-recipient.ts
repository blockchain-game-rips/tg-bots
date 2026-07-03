import { toHold } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { WithdrawAddressPrompt } from '../../prompts/withdraw-address-prompt'
import { EffectType } from '../../types'

export const promptWithdrawRecipient: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: WithdrawAddressPrompt.render(),
		onSubmit: actionIds.submitWithdrawRecipient,
	},
}))
