import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { formattedAmountWithUsd, formatUnits } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'
import { tokenLabel } from '../../utils/swap-utils'

export const SWAP_MAX_PAYLOAD = 'max'

export class SwapChooseAmountPage {
	static render(args: {
		amountIn: CurrencyAmountDto
		amountOut: CurrencyAmountDto
		balance: CurrencyAmountDto
	}): PageContent {
		const { amountIn, amountOut, balance } = args

		const maxPayload = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		const lines = [
			`Token in: ${tokenLabel(amountIn)}`,
			`Token out: ${tokenLabel(amountOut)}`,
			`Balance: ${formattedAmountWithUsd(balance)}`,
			'',
			'Choose amount to swap:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Swap Max',
				buildActionData(actionIds.showSwapConfirm, maxPayload),
			)
			.row()
			.text('Custom amount', actionIds.respondWithdrawCustomAmount)
			.row()

		addNav(keyboard, {
			parent: actionIds.showSwapChooseChain,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
