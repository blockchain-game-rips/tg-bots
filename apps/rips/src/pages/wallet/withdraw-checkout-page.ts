import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteWithdrawResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { withdrawBreadcrumb } from '../../utils/breadcrumb'
import { chainToName, findChainIndex } from '../../utils/chain'
import {
	formatAmountWithUsd,
	fundsBreakdown,
	insufficientBalanceLines,
} from '../../utils/currency'

export class WithdrawCheckoutPage {
	static render(args: {
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

		const chainIndex = findChainIndex(chain)

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
			keyboard.text('Update', actionIds.openWithdraw).row()
		} else {
			keyboard.text('Confirm', actionIds.executeWithdraw).row()
		}

		keyboard
			.text('Enter amount', actionIds.openWithdrawChooseAmount)
			.row()
			.text('Enter recipient', actionIds.promptWithdrawRecipient)
			.row()

		keyboard
			.row()
			.text(
				'Back',
				buildActionData(
					actionIds.openWithdrawChooseToken,
					chainIndex.toString(),
				),
			)
			.text('Home', buildActionData(actionIds.openHome))

		return { message: lines.join('\n'), keyboard }
	}
}
