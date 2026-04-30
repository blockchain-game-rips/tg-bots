import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto, CurrencyDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { findCurrencyIndex } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { configName, resolveConfig } from '../../utils/stake'

export class ZapChooseTokenPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		currencies: CurrencyDto[]
	}): PageContent {
		const { availableStake, ticketCount, currencies } = args
		const config = resolveConfig(availableStake)
		const chain = currencies[0].chainAddress.chain

		const lines = [
			`<b>🎮 Buy Tickets › ${configName(config)} › ${chainToName(chain)}</b>`,
			'',
			`Ticket count: ${ticketCount}`,
			'',
			'Choose a token to pay with:',
		]

		const keyboard = new InlineKeyboard()

		currencies.forEach((currency) => {
			const currencyIndex = findCurrencyIndex(currency.id)

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

		return { message: lines.join('\n'), keyboard }
	}
}
