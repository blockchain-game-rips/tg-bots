import { parseChain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { Chain } from '../../types'
import { findChainIndex } from '../../utils/chain'

export const openSwapChooseDstToken: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw, SUPPORTED_CHAINS),
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
