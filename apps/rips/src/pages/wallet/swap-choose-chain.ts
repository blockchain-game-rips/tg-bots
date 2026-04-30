import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { addNav } from '../../utils/keyboard'

export class SwapChooseChainPage {
	static render(): PageContent {
		const lines = ['Choose a chain:']

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard
				.text(
					chainToName(chain),
					buildActionData(
						actionIds.showSwapChooseToken,
						chainIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showSwapChooseChain,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
