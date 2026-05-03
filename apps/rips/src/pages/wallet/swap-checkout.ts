import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteSwapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

export class SwapCheckoutPage {
	static render(args: {
		currencyInBalance: CurrencyAmountDto
		nativeInBalance: CurrencyAmountDto
		amountIn: CurrencyAmountDto

		currencyOutBalance: CurrencyAmountDto

		swapQuote: QuoteSwapResponseDtoOutput

		userEvmAddress: string
	}): PageContent {
		const { amountIn, swapQuote } = args

		const lines = [
			`Token in: ${amountIn.currency.symbol}`,
			`Token out: ${swapQuote.amountOut.currency.symbol}`,
			'',
			`Pay: ${formatAmountWithUsd(amountIn)}`,
			`Receive: ${formatAmountWithUsd(swapQuote.amountOut)}`,
			'',
			`Swap fee: ${formatAmountWithUsd(swapQuote.fee)}`,
			`Network fee: ${formatAmountWithUsd(swapQuote.blockchainFee)}`,
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

		return { message: lines.join('\n'), keyboard }
	}
}
