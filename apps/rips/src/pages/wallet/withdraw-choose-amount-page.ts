import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd, formatUnits } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawChooseAmountPage {
	static render(balance: CurrencyAmountDto): PageContent {
		const { currency } = balance
		const chain = currency.chainAddress.chain

		const maxPayload = formatUnits(
			BigInt(balance.amount),
			currency.decimals,
		)

		const lines = [
			`Chain: ${chainToName(chain)}`,
			`Token: ${currency.symbol}`,
			`Balance: ${formatAmountWithUsd(balance)}`,
			'',
			'Choose amount to withdraw:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Withdraw Max',
				buildActionData(
					actionIds.respondWithdrawCustomAmount,
					maxPayload,
				),
			)
			.row()
			.text('Custom amount', actionIds.askWithdrawAmount)
			.row()

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
