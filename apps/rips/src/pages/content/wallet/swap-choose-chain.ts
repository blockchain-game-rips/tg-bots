import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export class SwapChooseChainPage {
	static render(): PageContent {
		const lines = ['Choose a chain:']

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard.text(
				chain.name,
				buildCommand({
					pageId: pageIds.swapChooseToken,
					type: 'open',
					payloads: [chainIndex.toString()],
				}),
			)
			keyboard.row()
		})

		addNav(keyboard, { parent: pageIds.swap, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
