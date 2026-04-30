import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { addNav } from '../../utils/keyboard'

export class WithdrawChooseChainPage {
	static render(): PageContent {
		const lines = ['<b>💸 Withdraw</b>', '', 'Select a chain:']

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard
				.text(
					chainToName(chain),
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
