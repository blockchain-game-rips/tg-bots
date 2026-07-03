import { toHold } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { SwapChooseChainPage } from '../../pages/wallet/swap-choose-chain'
import { EffectType } from '../../types'

export const openSwapChooseChainOut: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: { type: EffectType.EDIT, page: SwapChooseChainPage.render('out') },
}))
