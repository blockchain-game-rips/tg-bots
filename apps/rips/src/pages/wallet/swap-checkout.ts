import { CurrencyAmountDto, QuoteSwapResponseDtoOutput } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import {
	formatAmountWithUsd,
	fundsBreakdown,
	insufficientBalanceLines,
	swapBreadcrumb,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'

const TRANSACTION_SEND_OVERHEAD_SECONDS = 4

export const SwapCheckoutPage = {
	render(args: {
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
			chainToName,
		)

		const insufficient = insufficientAmounts.length > 0

		const lines = [
			swapBreadcrumb(),
			'',
			`Pay: ${formatAmountWithUsd(amountIn)}`,
			`Receive: ${formatAmountWithUsd(swapQuote.amountOut)}`,
			`Estimated time: ${toShortDurationFormat(swapQuote.durationMs / 1000 + TRANSACTION_SEND_OVERHEAD_SECONDS)}`,
			'',
			...breakdownLines,
		]

		if (insufficient) {
			lines.push(
				'',
				...insufficientBalanceLines({
					tokenAmount: amountIn,
					feeAmount: swapQuote.blockchainFee,
					insufficientAmounts,
					userEvmAddress,
					feeLabel: 'network fee',
				}),
			)
		}

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text('Update', buildActionData(actionIds.openSwap, undefined))
				.row()
		} else {
			keyboard
				.text(
					'Confirm',
					buildActionData(actionIds.executeSwap, undefined),
				)
				.row()
		}

		addNav(keyboard, {
			parent: actionIds.openSwap,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
