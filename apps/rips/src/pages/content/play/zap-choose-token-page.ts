import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav, configName, getConfig } from '../../utils'

export class ZapChooseTokenPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		chainIndex: number
	}): PageContent {
		const { availableStake, ticketCount, chainIndex } = args
		const config = getConfig(availableStake)
		const chain = SUPPORTED_CHAINS[chainIndex]

		const chainCurrencies = SUPPORTED_CURRENCIES.filter(
			(c) =>
				c.chainAddress.chain.namespace === chain.namespace &&
				c.chainAddress.chain.reference === chain.reference,
		)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			`Chain: ${chain.name}`,
			'',
			'Choose a token to pay with:',
		]

		const keyboard = new InlineKeyboard()

		chainCurrencies.forEach((currency) => {
			const currencyIndex = SUPPORTED_CURRENCIES.indexOf(currency)

			keyboard.text(
				currency.symbol,
				buildCommand({
					pageId: pageIds.zapConfirm,
					type: 'open',
					payloads: [currencyIndex.toString()],
				}),
			)
			keyboard.row()
		})

		addNav(keyboard, { parent: pageIds.zapChooseChain, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
