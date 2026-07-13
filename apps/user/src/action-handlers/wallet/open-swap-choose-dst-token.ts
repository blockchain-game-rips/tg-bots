import { ActionDef, withPayload } from '../../action-def'
import { Chain } from '../../types'
import { chainCodec } from '../../utils/chain'

export const openSwapChooseDstToken: ActionDef<Chain> = withPayload(
	chainCodec,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
