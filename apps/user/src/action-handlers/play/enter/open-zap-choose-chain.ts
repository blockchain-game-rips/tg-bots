import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../../action-def'
import { toHold } from '../../../flows'
import { ZapChooseChainPage } from '../../../pages/play/zap-choose-chain-page'
import { EffectType } from '../../../types'

export const openZapChooseChain: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

	const { availablePreset } = session.flow.data

	return {
		flow: toHold(),
		effect: {
			type: EffectType.EDIT,
			page: ZapChooseChainPage.render({ availablePreset }),
		},
	}
})
