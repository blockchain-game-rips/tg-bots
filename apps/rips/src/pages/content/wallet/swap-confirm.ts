import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteSwapResponseDtoOutput,
} from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

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
			buildCommand({
				pageId: pageIds.wallet,
				type: 'open',
				payloads: [],
			}),
		)

		addNav(keyboard, {
			parent: pageIds.swapChooseAmount,
			home: pageIds.home,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
