import { isFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../../action-def'
import { actionIds } from '../../../actions'
import { toHold } from '../../../flows'
import { CustomEntryAmountPrompt } from '../../../prompts/custom-entry-amount-prompt'
import { EffectType } from '../../../types'

export const promptEntryCount: ActionDef<void> = noPayload((session) => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: CustomEntryAmountPrompt.render(),
		onSubmit: isFlow(session, 'enter', 'at-checkout')
			? actionIds.openEnterCheckoutFromEntryCount
			: actionIds.openEnterPaymentOptionsFromEntryCount,
	},
}))
