import { actionIds } from '../../actions'
import { SwapSelecting } from '../../flows'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { buildChooseChainPage } from '../choose-chain-token'

export class SwapChooseChainPage {
	static render(selecting: SwapSelecting): PageContent {
		const label = selecting === 'in' ? 'token in' : 'token out'

		return buildChooseChainPage({
			lines: [swapBreadcrumb(), '', `Choose a chain for ${label}:`],
			chainActionId: actionIds.showSwapChooseToken,
			chainPayload: (chainIndex) => `${selecting}:${chainIndex}`,
			nav: { parent: actionIds.showSwap, home: actionIds.showHome },
		})
	}
}
