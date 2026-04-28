import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { addNav, buildActionData } from '../../utils'

export class WithdrawChooseChainPage {
	static render(): PageContent {
		const lines = ['Choose a chain to withdraw from:']

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard
				.text(
					chain.name,
					buildActionData(
						actionIds.showWithdrawChooseToken,
						chainIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showWallet,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
