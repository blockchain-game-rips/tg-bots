import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { CustomEntryAmountPrompt } from '../../prompts/custom-entry-amount-prompt'
import { EffectType } from '../../types'

export const promptEntryCount: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: CustomEntryAmountPrompt.render(),
	onSubmit: actionIds.openBuyCheckout,
}))
