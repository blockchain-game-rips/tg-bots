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

export class SwapInsufficientFundsPage {
	static render(args: {
		tokenInIndex: number
		tokenOutIndex: number
		amountIn: CurrencyAmountDto
		balance: CurrencyAmountDto
		swapQuote: QuoteSwapResponseDtoOutput
		userEvmAddress: string
	}): PageContent {
		const {
			tokenInIndex,
			tokenOutIndex,
			amountIn,
			balance,
			swapQuote,
			userEvmAddress,
		} = args
		const tokenIn = SUPPORTED_CURRENCIES[tokenInIndex]
		const tokenOut = SUPPORTED_CURRENCIES[tokenOutIndex]

		const lines = [
			`Token in: ${tokenIn.symbol}`,
			`Token out: ${tokenOut.symbol}`,
			'',
			`⚠️ Not enough funds.`,
			`Required: ${formattedAmountWithUsd(amountIn)}`,
			`Your balance: ${formattedAmountWithUsd(balance)}`,
			'',
			`Swap fee: ${formattedAmountWithUsd(swapQuote.fee)}`,
			'',
			`Address: ${userEvmAddress}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Choose amount',
			buildCommand({
				pageId: pageIds.swapChooseAmount,
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
