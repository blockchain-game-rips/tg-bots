import { CurrencyAmountDto, TransactionDto } from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { chainToName, currencyToChain } from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawSuccessPage = {
	render(args: {
		transaction: TransactionDto
		currencyAmount: CurrencyAmountDto
		blockchainFee?: CurrencyAmountDto
		recipientAddress: string
	}): PageContent {
		const { transaction, currencyAmount, blockchainFee, recipientAddress } =
			args

		const { currency } = currencyAmount
		const chain = currencyToChain(currency)

		const lines: Line[] = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			'✅ Withdrawal successful!',
			'',
			`${formatAmountWithUsd(currencyAmount)} sent to`,
			FormattedString.code(recipientAddress),
		]

		if (blockchainFee !== undefined) {
			lines.push('')
			lines.push(`Blockchain fee: ${formatAmountWithUsd(blockchainFee)}`)
		}

		lines.push('')
		lines.push(fmt`Transaction: ${FormattedString.code(transaction.id)}`)

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
