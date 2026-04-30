import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteSwapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class SwapInsufficientFundsPage {
	static render(args: {
		amountIn: CurrencyAmountDto
		balance: CurrencyAmountDto
		swapQuote: QuoteSwapResponseDtoOutput
		userEvmAddress: string
	}): PageContent {
		const { amountIn, balance, swapQuote, userEvmAddress } = args

		const lines = [
			`Token in: ${amountIn.currency.symbol}`,
			`Token out: ${swapQuote.amountOut.currency.symbol}`,
			'',
			`⚠️ Not enough funds.`,
			`Required: ${formatAmountWithUsd(amountIn)}`,
			`Your balance: ${formatAmountWithUsd(balance)}`,
			'',
			`Swap fee: ${formatAmountWithUsd(swapQuote.fee)}`,
			'',
			`Address: ${userEvmAddress}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Choose amount',
			actionIds.showSwapChooseAmount,
		)

		addNav(keyboard, {
			parent: actionIds.showSwapChooseAmount,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
