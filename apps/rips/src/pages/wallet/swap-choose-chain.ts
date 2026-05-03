import { InlineKeyboard } from 'grammy'
import { SwapSelecting } from '../../flows'
import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { chainToName } from '../../utils/chain'
import { addNav } from '../../utils/keyboard'

export class SwapChooseChainPage {
	static render(selecting: SwapSelecting): PageContent {
		const label = selecting === 'in' ? 'token in' : 'token out'

		const lines = [swapBreadcrumb(), '', `Choose a chain for ${label}:`]

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard
				.text(
					chainToName(chain),
					buildActionData(
						actionIds.showSwapChooseToken,
						`${selecting}:${chainIndex}`,
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showSwap,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
