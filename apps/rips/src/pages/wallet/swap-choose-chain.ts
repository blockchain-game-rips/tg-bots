import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { SwapSelecting } from '../../flows'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { buildChooseChainPage } from '../choose-chain-token'

export class SwapChooseChainPage {
	static render(selecting: SwapSelecting): PageContent {
		const label = selecting === 'in' ? 'token in' : 'token out'
		const chainActionId =
			selecting === 'in'
				? actionIds.openSwapChooseTokenIn
				: actionIds.openSwapChooseTokenOut

		return buildChooseChainPage({
			lines: [swapBreadcrumb(), '', `Choose a chain for ${label}:`],
			chainActionId,
			chainPayload: (chainIndex) => SUPPORTED_CHAINS[chainIndex],
			nav: { parent: actionIds.openSwap, home: actionIds.openHome },
		})
	}
}
