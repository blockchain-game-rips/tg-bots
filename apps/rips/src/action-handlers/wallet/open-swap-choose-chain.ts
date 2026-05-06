import { ActionDef, withPayload } from '../../action-def'
import { SwapSelecting } from '../../flows'
import { SwapChooseChainPage } from '../../pages/wallet/swap-choose-chain'
import { EffectType } from '../../types'
import { parseSwapSelecting } from '../../validation/swap-selecting'

export const openSwapChooseChain: ActionDef<SwapSelecting> = withPayload(
	(selecting) => selecting,
	(raw) => parseSwapSelecting(raw),
	(_session, selecting) => ({
		type: EffectType.EDIT,
		page: SwapChooseChainPage.render(selecting),
	}),
)
