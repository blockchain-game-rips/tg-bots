import { ChainAddressDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { ActionId } from '../types'
import { chainToName } from './chain'

export function buildChainKeyboard(
	chains: Chain[],
	onChainSelectedActionId: ActionId<Chain>,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	chains.forEach((chain) => {
		keyboard
			.text(
				chainToName(chain),
				buildActionData(onChainSelectedActionId, chain),
			)
			.row()
	})

	return keyboard
}

export function buildCurrencyKeyboard(
	currencies: CurrencyDtoOutput[],
	onCurrencySelectedActionId: ActionId<ChainAddressDtoOutput>,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	currencies.forEach((currency) => {
		keyboard
			.text(
				currency.symbol,
				buildActionData(
					onCurrencySelectedActionId,
					currency.chainAddress,
				),
			)
			.row()
	})

	return keyboard
}
