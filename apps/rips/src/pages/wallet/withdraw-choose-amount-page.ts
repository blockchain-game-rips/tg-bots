import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd, formatUnits } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

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
				buildActionData(actionIds.submitWithdrawAmount, maxPayload),
			)
			.row()
			.text('Custom amount', actionIds.promptWithdrawAmount)
			.row()

		addNav(keyboard, {
			parent: actionIds.openWithdrawChooseToken,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
