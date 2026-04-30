import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteWithdrawResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd, fundsBreakdown } from '../../utils/currency'
import { messageFromLines } from '../../utils/message'

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

		const chainIndex = SUPPORTED_CHAINS.findIndex(
			(c) =>
				c.namespace === chain.namespace &&
				c.reference === chain.reference,
		)

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
			`<b>💸 Withdraw › ${chainToName(chain)} › ${currency.symbol}</b>`,
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
			lines.push('')

			const tokenInsufficient = insufficientAmounts.some(
				(a) => a.currency.id === currencyAmount.currency.id,
			)

			if (tokenInsufficient) {
				const tokenSymbol = currencyAmount.currency.symbol
				lines.push(`⚠️ <b>Insufficient ${tokenSymbol}</b>`)
				lines.push('')
				lines.push('Enter a smaller amount')
			} else {
				const feeSymbol = withdrawQuote.blockchainFee.currency.symbol
				lines.push(
					`⚠️ <b>Insufficient ${feeSymbol} for blockchain fee</b>`,
				)
				lines.push('')
				lines.push(`Deposit ${feeSymbol} to:`)
				lines.push(`<code>${userEvmAddress}</code>`)
				lines.push('')
				lines.push('Then press Update')
			}
		} else {
			lines.push('')
			lines.push('Confirm to proceed')
		}

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard.text('Update', actionIds.showWithdraw).row()
		} else {
			keyboard.text('Confirm', actionIds.sendWithdrawTx).row()
		}

		keyboard
			.text('Enter amount', actionIds.showWithdrawChooseAmount)
			.row()
			.text('Enter recipient', actionIds.askWithdrawRecipient)
			.row()

		keyboard
			.row()
			.text(
				'Back',
				buildActionData(
					actionIds.showWithdrawChooseToken,
					chainIndex.toString(),
				),
			)
			.text('Home', buildActionData(actionIds.showHome))

		return { message: messageFromLines(lines), keyboard }
	}
}
