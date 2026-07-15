import { CurrencyAmountDto, TransactionDto } from '@rips/api-client'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
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
		const chain = currency.chainAddress.chain

		const lines = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			'✅ Withdrawal successful!',
			'',
			`${formatAmountWithUsd(currencyAmount)} sent to`,
			`<code>${recipientAddress}</code>`,
		]

		if (blockchainFee !== undefined) {
			lines.push('')
			lines.push(`Blockchain fee: ${formatAmountWithUsd(blockchainFee)}`)
		}

		lines.push('')
		lines.push(`Transaction: <code>${transaction.id}</code>`)

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
