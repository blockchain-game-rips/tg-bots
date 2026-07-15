import {
	CurrencyAmountDto,
	QuoteWithdrawResponseDtoOutput,
} from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import {
	formatAmountWithUsd,
	fundsBreakdown,
	insufficientBalanceLines,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
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
		const chain = currency.chainAddress.chain

		const { lines: breakdownLines, insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Amount', amount: currencyAmount },
				{
					label: 'Blockchain fee',
					amount: withdrawQuote.blockchainFee,
				},
			],
			[currencyBalance, nativeBalance],
			chainToName,
		)

		const insufficient = insufficientAmounts.length > 0

		const lines = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			'Amount',
			formatAmountWithUsd(currencyAmount),
			'',
			'Recipient',
			recipientAddress,
			'',
			...breakdownLines,
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
				buildActionData(actionIds.openWithdrawChooseToken, chain),
			)
			.appendHomeButton()

		return { message: lines.join('\n'), keyboard }
	},
}
