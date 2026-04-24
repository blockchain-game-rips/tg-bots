import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { promptIds } from '../../../prompts/prompt-ids'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export class WithdrawChooseReceiverPage {
	static render(args: {
		chainIndex: number
		currencyIndex: number
		amount: string
	}): PageContent {
		const { chainIndex, currencyIndex, amount } = args
		const chain = SUPPORTED_CHAINS[chainIndex]
		const currency = SUPPORTED_CURRENCIES[currencyIndex]

		const lines = [
			`Chain: ${chain.name}`,
			`Token: ${currency.symbol}`,
			`Amount: ${amount}`,
			'',
			'Enter recipient address:',
		]

		const keyboard = new InlineKeyboard().text(
			'Enter address',
			buildCommand({
				type: 'reply',
				promptId: promptIds.withdrawRecipient,
			}),
		)

		addNav(keyboard, {
			parent: pageIds.withdrawChooseAmount,
			home: pageIds.home,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
