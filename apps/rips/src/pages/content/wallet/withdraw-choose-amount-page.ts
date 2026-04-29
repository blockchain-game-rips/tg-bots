import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { formattedAmountWithUsd } from '../../../utils/currency'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'

export const WITHDRAW_MAX_PAYLOAD = 'max'

export class WithdrawChooseAmountPage {
	static render(args: {
		chainIndex: number
		currencyIndex: number
		balance: CurrencyAmountDto
	}): PageContent {
		const { chainIndex, currencyIndex, balance } = args
		const chain = SUPPORTED_CHAINS[chainIndex]
		const currency = SUPPORTED_CURRENCIES[currencyIndex]

		const lines = [
			`Chain: ${chain.name}`,
			`Token: ${currency.symbol}`,
			`Balance: ${formattedAmountWithUsd(balance)}`,
			'',
			'Choose amount to withdraw:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Withdraw Max',
				buildActionData(
					actionIds.showWithdrawChooseReceiver,
					WITHDRAW_MAX_PAYLOAD,
				),
			)
			.row()
			.text('Custom amount', actionIds.requestWithdrawCustomAmount)
			.row()

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
