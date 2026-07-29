import {
	CurrencyAmountDto,
	QuoteWithdrawResponseDtoOutput,
} from '@rips/api-client'
import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import {
	formatAmountWithUsd,
	fundsBreakdown,
	insufficientBalanceLines,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChain } from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawCheckoutPage = {
	render(args: {
		currencyBalance: CurrencyAmountDto
		nativeBalance: CurrencyAmountDto
		currencyAmount: CurrencyAmountDto
		withdrawQuote: QuoteWithdrawResponseDtoOutput
		recipientAddress: string
		userEvmAddress: string
	}): PageContent {
		const {
			currencyBalance,
			nativeBalance,
			currencyAmount,
			withdrawQuote,
			recipientAddress,
			userEvmAddress,
		} = args

		const { currency } = currencyAmount
		const chain = currencyToChain(currency)

		const { insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Amount', amount: currencyAmount },
				{
					label: 'Blockchain fee',
					amount: withdrawQuote.blockchainFee,
				},
			],
			[currencyBalance, nativeBalance],
		)

		const insufficient = insufficientAmounts.length > 0

		const lines: Line[] = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			'Amount',
			formatAmountWithUsd(currencyAmount),
			'',
			'Recipient',
			recipientAddress,
		]

		if (insufficient) {
			lines.push(
				'',
				...insufficientBalanceLines({
					tokenAmount: currencyAmount,
					feeAmount: withdrawQuote.blockchainFee,
					insufficientAmounts,
					userEvmAddress,
					feeLabel: 'blockchain fee',
				}),
			)
		} else {
			lines.push('')
			lines.push('Confirm to proceed')
		}

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text(
					'Update',
					buildActionData(
						actionIds.refreshWithdrawCheckout,
						undefined,
					),
				)
				.row()
		} else {
			keyboard
				.text(
					'Confirm',
					buildActionData(actionIds.executeWithdraw, undefined),
				)
				.row()
		}

		keyboard
			.text(
				'Enter amount',
				buildActionData(actionIds.openWithdrawChooseAmount, undefined),
			)
			.row()
			.text(
				'Enter recipient',
				buildActionData(actionIds.promptWithdrawRecipient, undefined),
			)
			.row()
			.text(
				'Back',
				buildActionData(actionIds.openWithdrawChooseCurrency, chain),
			)
			.appendHomeButton()

		return { message: joinLines(lines), keyboard }
	},
}
