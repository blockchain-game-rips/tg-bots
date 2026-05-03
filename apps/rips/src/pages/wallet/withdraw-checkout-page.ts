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
import { formatAmountWithUsd, fundsBreakdown } from '../../utils/currency'

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
