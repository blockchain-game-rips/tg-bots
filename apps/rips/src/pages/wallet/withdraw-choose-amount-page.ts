import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd, formatUnits } from '../../utils/currency'

export const WithdrawChooseAmountPage = {
	render(balance: CurrencyAmountDto): PageContent {
		const { currency } = balance
		const chain = currency.chainAddress.chain

		const maxAmount = formatUnits(BigInt(balance.amount), currency.decimals)

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
				buildActionData(actionIds.submitWithdrawAmount, maxAmount),
			)
			.row()
			.text(
				'Custom amount',
				buildActionData(actionIds.promptWithdrawAmount, undefined),
			)
			.row()

		addNav(keyboard, {
			parent: actionIds.openWithdrawChooseToken,
			parentPayload: chain,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
