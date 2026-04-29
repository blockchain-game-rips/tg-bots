import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteSwapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { PageContent } from '../../types'
import { formattedAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class SwapConfirmPage {
	static render(args: {
		tokenInIndex: number
		tokenOutIndex: number
		amountIn: CurrencyAmountDto
		networkFee: CurrencyAmountDto
		swapQuote: QuoteSwapResponseDtoOutput
	}): PageContent {
		const { tokenInIndex, tokenOutIndex, amountIn, networkFee, swapQuote } =
			args
		const tokenIn = SUPPORTED_CURRENCIES[tokenInIndex]
		const tokenOut = SUPPORTED_CURRENCIES[tokenOutIndex]

		const lines = [
			`Token in: ${tokenIn.symbol}`,
			`Token out: ${tokenOut.symbol}`,
			'',
			`Pay: ${formattedAmountWithUsd(amountIn)}`,
			`Receive: ${formattedAmountWithUsd(swapQuote.amountOut)}`,
			'',
			`Swap fee: ${formattedAmountWithUsd(swapQuote.fee)}`,
			`Network fee: ${formattedAmountWithUsd(networkFee)}`,
			'',
			'Confirm to proceed with swap',
		]

		const keyboard = new InlineKeyboard().text(
			'Confirm',
			actionIds.executeSwap,
		)

		addNav(keyboard, {
			parent: actionIds.showSwapChooseAmount,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
