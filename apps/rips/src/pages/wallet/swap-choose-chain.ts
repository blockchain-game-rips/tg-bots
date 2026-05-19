import { actionIds } from '../../actions'
import { SwapSelecting } from '../../flows'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChooseChainPage } from '../choose-chain-token'

export const SwapChooseChainPage = {
	render(selecting: SwapSelecting): PageContent {
		const label = selecting === 'in' ? 'token in' : 'token out'
		const chainActionId =
			selecting === 'in'
				? actionIds.openSwapChooseTokenIn
				: actionIds.openSwapChooseTokenOut

		return buildChooseChainPage({
			lines: [swapBreadcrumb(), '', `Choose a chain for ${label}:`],
			chainActionId,
			chainPayload: (chain) => chain,
			nav: { parent: actionIds.openSwap, home: actionIds.openHome },
		})
	},
}
