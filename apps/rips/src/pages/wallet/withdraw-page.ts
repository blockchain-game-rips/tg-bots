import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'
import { messageFromLines } from '../../utils/message'

export class WithdrawPage {
	static render(
		currencyBalance: CurrencyAmountDto,
		amountToWithdraw?: CurrencyAmountDto,
		recipientAddress?: string,
	): PageContent {
		const { currency } = currencyBalance
		const chain = currency.chainAddress.chain

		const chainIndex = SUPPORTED_CHAINS.findIndex(
			(c) =>
				c.namespace === chain.namespace &&
				c.reference === chain.reference,
		)

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

		return { message: messageFromLines(lines), keyboard }
	}
}
