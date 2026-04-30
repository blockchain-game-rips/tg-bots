import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteSwapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formattedAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class SwapConfirmPage {
	static render(args: {
		amountIn: CurrencyAmountDto
		networkFee: CurrencyAmountDto
		swapQuote: QuoteSwapResponseDtoOutput
	}): PageContent {
		const { amountIn, networkFee, swapQuote } = args

		const lines = [
			`Token in: ${amountIn.currency.symbol}`,
			`Token out: ${swapQuote.amountOut.currency.symbol}`,
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
