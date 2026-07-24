import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { toHold } from '../../flows'
import { CustomEntryAmountPrompt } from '../../prompts/custom-entry-amount-prompt'
import { EffectType } from '../../types'

export const promptEntryCount: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: CustomEntryAmountPrompt.render(),
		onSubmit: actionIds.openEnterCheckout,
	},
}))
