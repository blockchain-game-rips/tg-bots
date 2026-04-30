import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName, findChainIndex } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'

export class WithdrawPage {
	static render(
		currencyBalance: CurrencyAmountDto,
		amountToWithdraw?: CurrencyAmountDto,
		recipientAddress?: string,
	): PageContent {
		const { currency } = currencyBalance
		const chain = currency.chainAddress.chain

		const chainIndex = findChainIndex(chain)

		const amount =
			amountToWithdraw !== undefined
				? formatAmountWithUsd(amountToWithdraw)
				: '-'

		const recipient =
			recipientAddress !== undefined ? recipientAddress : '-'

		const lines = [
			`<b>💸 Withdraw › ${chainToName(chain)} › ${currency.symbol}</b>`,
			'',
			`Balance: ${formatAmountWithUsd(currencyBalance)}`,
			'',
			'Amount',
			amount,
			'',
			'Recipient',
			recipient,
		]

		const keyboard = new InlineKeyboard()
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

		return { message: lines.join('\n'), keyboard }
	}
}
