import { CurrencyAmountDtoOutput } from '@rips/api-client'
import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import { currencyToChain } from '@rips/shared'
import { chainToName } from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'
import * as labels from '../../utils/button-labels'

export const WithdrawChooseAmountPage = {
	render(balance: CurrencyAmountDtoOutput): PageContent {
		const { currency } = balance
		const chain = currencyToChain(currency)

		const lines: Line[] = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			`Balance: ${formatAmountWithUsd(balance)}`,
			'',
			'Choose amount to withdraw:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				labels.WITHDRAW_MAX,
				buildActionData(actionIds.openWithdrawFromAmount, {
					kind: 'max',
				}),
			)
			.row()
			.text(
				labels.CUSTOM_AMOUNT,
				buildActionData(actionIds.promptWithdrawAmount, undefined),
			)
			.row()

		keyboard.appendNavButtons()

		return { message: joinLines(lines), keyboard }
	},
}
