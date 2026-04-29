import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'
import { configName, resolveConfig } from '../../../utils/stake'

export class ZapChooseTokenPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		chainIndex: number
	}): PageContent {
		const { availableStake, ticketCount, chainIndex } = args
		const config = resolveConfig(availableStake)
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

			keyboard
				.text(
					currency.symbol,
					buildActionData(
						actionIds.showZapConfirm,
						currencyIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showZapChooseChain,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
