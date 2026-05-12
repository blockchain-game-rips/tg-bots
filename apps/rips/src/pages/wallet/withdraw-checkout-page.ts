import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteWithdrawResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { withdrawBreadcrumb } from '../../utils/breadcrumb'
import { chainToName } from '../../utils/chain'
import {
	formatAmountWithUsd,
	fundsBreakdown,
	insufficientBalanceLines,
} from '../../utils/currency'

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
				buildActionData(
					actionIds.openWithdrawChooseToken,
					chain as Chain,
				),
			)
			.text('Home', buildActionData(actionIds.openHome, undefined))

		return { message: lines.join('\n'), keyboard }
	},
}
