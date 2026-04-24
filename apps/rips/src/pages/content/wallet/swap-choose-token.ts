import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export class SwapChooseTokenPage {
	static render(args: { chainIndex: number }): PageContent {
		const { chainIndex } = args
		const chain = SUPPORTED_CHAINS[chainIndex]

		const chainCurrencies = SUPPORTED_CURRENCIES.filter(
			(c) =>
				c.chainAddress.chain.namespace === chain.namespace &&
				c.chainAddress.chain.reference === chain.reference,
		)

		const lines = [`Chain: ${chain.name}`, '', 'Choose a token:']

		const keyboard = new InlineKeyboard()

		chainCurrencies.forEach((currency) => {
			const currencyIndex = SUPPORTED_CURRENCIES.indexOf(currency)

			keyboard.text(
				currency.symbol,
				buildCommand({
					pageId: pageIds.swap,
					type: 'open',
					payloads: [currencyIndex.toString()],
				}),
			)
			keyboard.row()
		})

		addNav(keyboard, {
			parent: pageIds.swapChooseChain,
			home: pageIds.home,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
