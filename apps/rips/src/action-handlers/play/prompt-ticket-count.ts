import { ActionDef, noPayload } from '../../action-def'
import { actionIds } from '../../actions'
import { CustomTicketAmountPrompt } from '../../prompts/custom-ticket-amount-prompt'
import { EffectType } from '../../types'

export const promptTicketCount: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: CustomTicketAmountPrompt.render(),
	onSubmit: actionIds.openBuyCheckout,
}))
