import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { formattedAmountWithUsd } from '../../../utils/currency'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'
import { tokenLabel } from '../../../utils/swap-utils'

export const SWAP_MAX_PAYLOAD = 'max'

export class SwapChooseAmountPage {
	static render(args: {
		tokenInIndex: number
		tokenOutIndex: number
		chainInIndex: number
		chainOutIndex: number
		balance: CurrencyAmountDto
	}): PageContent {
		const {
			tokenInIndex,
			tokenOutIndex,
			chainInIndex,
			chainOutIndex,
			balance,
		} = args

		const lines = [
			`Token in: ${tokenLabel({ tokenIndex: tokenInIndex, chainIndex: chainInIndex })}`,
			`Token out: ${tokenLabel({ tokenIndex: tokenOutIndex, chainIndex: chainOutIndex })}`,
			`Balance: ${formattedAmountWithUsd(balance)}`,
			'',
			'Choose amount to swap:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Swap Max',
				buildActionData(actionIds.showSwapConfirm, SWAP_MAX_PAYLOAD),
			)
			.row()
			.text('Custom amount', actionIds.requestWithdrawCustomAmount)
			.row()

		addNav(keyboard, {
			parent: actionIds.showSwapChooseChain,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
