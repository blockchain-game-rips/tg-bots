import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	TransactionDto,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'
import { messageFromLines } from '../../utils/message'

export class WithdrawSuccessPage {
	static render(args: {
		transaction: TransactionDto
		currencyAmount: CurrencyAmountDto
		blockchainFee: CurrencyAmountDto
		recipientAddress: string
	}): PageContent {
		const { transaction, currencyAmount, blockchainFee, recipientAddress } =
			args

		const { currency } = currencyAmount
		const chain = currency.chainAddress.chain

		const lines = [
			`<b>💸 Withdraw › ${chainToName(chain)} › ${currency.symbol}</b>`,
			'',
			'✅ Withdrawal successful!',
			'',
			`${formatAmountWithUsd(currencyAmount)} sent to`,
			`<code>${recipientAddress}</code>`,
			'',
			`Blockchain fee: ${formatAmountWithUsd(blockchainFee)}`,
			`Transaction: <code>${transaction.id}</code>`,
		]

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
