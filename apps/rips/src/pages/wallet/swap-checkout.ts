import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteSwapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd, fundsBreakdown } from '../../utils/currency'
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
		const {
			currencyInBalance,
			nativeInBalance,
			amountIn,
			swapQuote,
			userEvmAddress,
		} = args

		const { lines: breakdownLines, insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Amount', amount: amountIn },
				{ label: 'Swap fee', amount: swapQuote.fee },
				{ label: 'Network fee', amount: swapQuote.blockchainFee },
			],
			[currencyInBalance, nativeInBalance],
		)

		const insufficient = insufficientAmounts.length > 0

		const lines = [
			swapBreadcrumb(),
			'',
			`Pay: ${formatAmountWithUsd(amountIn)}`,
			`Receive: ${formatAmountWithUsd(swapQuote.amountOut)}`,
			'',
			...breakdownLines,
		]

		if (insufficient) {
			lines.push('')

			const tokenInsufficient = insufficientAmounts.some(
				(a) => a.currency.id === amountIn.currency.id,
			)

			//TODO: the same in withdraw checkout, move to the separate function
			if (tokenInsufficient) {
				const tokenSymbol = amountIn.currency.symbol
				lines.push(`⚠️ <b>Insufficient ${tokenSymbol}</b>`)
				lines.push('')
				lines.push('Enter a smaller amount')
			} else {
				const feeSymbol = swapQuote.blockchainFee.currency.symbol
				lines.push(
					`⚠️ <b>Insufficient ${feeSymbol} for network fee</b>`,
				)
				lines.push('')
				lines.push(`Deposit ${feeSymbol} to:`)
				lines.push(`<code>${userEvmAddress}</code>`)
				lines.push('')
				lines.push('Then press Update')
			}
		}

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard.text('Update', actionIds.openSwap).row()
		} else {
			keyboard.text('Confirm', actionIds.executeSwap).row()
		}

		addNav(keyboard, {
			parent: actionIds.openSwap,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
