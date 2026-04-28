import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { addNav, buildActionData } from '../../utils'

export class SwapChooseChainPage {
	static render(): PageContent {
		const lines = ['Choose a chain:']

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard
				.text(
					chain.name,
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
