import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { actionIds } from '../../grammy-kit/action/actions'
import { CustomTicketAmountPrompt } from '../../prompts/custom-ticket-amount-prompt'
import { EffectType } from '../../types'

export const promptTicketCount: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: CustomTicketAmountPrompt.render(),
	onSubmit: actionIds.openBuyCheckout,
}))
