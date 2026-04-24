import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { promptIds } from '../../../prompts/prompt-ids'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

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
				buildCommand({
					pageId: pageIds.withdrawChooseReceiver,
					type: 'open',
					payloads: [WITHDRAW_MAX_PAYLOAD],
				}),
			)
			.row()
			.text(
				'Custom amount',
				buildCommand({
					type: 'reply',
					promptId: promptIds.customWithdrawAmount,
				}),
			)
			.row()

		addNav(keyboard, {
			parent: pageIds.withdrawChooseToken,
			home: pageIds.home,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
