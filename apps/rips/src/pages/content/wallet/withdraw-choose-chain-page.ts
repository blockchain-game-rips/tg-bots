import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export class WithdrawChooseChainPage {
	static render(): PageContent {
		const lines = ['Choose a chain to withdraw from:']

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard.text(
				chain.name,
				buildCommand({
					pageId: pageIds.withdrawChooseToken,
					type: 'open',
					payloads: [chainIndex.toString()],
				}),
			)
			keyboard.row()
		})

		addNav(keyboard, { parent: pageIds.wallet, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
