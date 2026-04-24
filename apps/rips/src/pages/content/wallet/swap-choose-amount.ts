import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CURRENCIES } from '../../../constants'
import { promptIds } from '../../../prompts/prompt-ids'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export const SWAP_MAX_PAYLOAD = 'max'

export class SwapChooseAmountPage {
	static render(args: {
		tokenInIndex: number
		tokenOutIndex: number
		balance: CurrencyAmountDto
	}): PageContent {
		const { tokenInIndex, tokenOutIndex, balance } = args
		const tokenIn = SUPPORTED_CURRENCIES[tokenInIndex]
		const tokenOut = SUPPORTED_CURRENCIES[tokenOutIndex]

		const lines = [
			`Token in: ${tokenIn.symbol}`,
			`Token out: ${tokenOut.symbol}`,
			`Balance: ${formattedAmountWithUsd(balance)}`,
			'',
			'Choose amount to swap:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Swap Max',
				buildCommand({
					pageId: pageIds.swapConfirm,
					type: 'open',
					payloads: [SWAP_MAX_PAYLOAD],
				}),
			)
			.row()
			.text(
				'Custom amount',
				buildCommand({
					type: 'reply',
					promptId: promptIds.customWithdrawAmount,
				}),
			)
			.row()

		addNav(keyboard, { parent: pageIds.swap, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
