import { InlineKeyboard } from 'grammy'
import { CurrencyDto } from '../../generated/api-client'
import { ActionId } from '../actions'
import { SUPPORTED_CHAINS } from '../constants'
import { NavIds, PageContent } from '../types'
import { buildActionData } from '../utils/action-data'
import { chainToName } from '../utils/chain'
import { findCurrencyIndex } from '../utils/currency'
import { addNav } from '../utils/keyboard'

type ChooseChainParams = {
	lines: string[]
	chainActionId: ActionId
	chainPayload: (chainIndex: number) => string
	nav: NavIds
}

type ChooseTokenParams = {
	lines: string[]
	currencies: CurrencyDto[]
	tokenActionId: ActionId
	tokenPayload: (currencyIndex: number) => string
	nav: NavIds
}

export function buildChooseChainPage(params: ChooseChainParams): PageContent {
	const { lines, chainActionId, chainPayload, nav } = params

	const keyboard = new InlineKeyboard()

	SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
		keyboard
			.text(
				chainToName(chain),
				buildActionData(chainActionId, chainPayload(chainIndex)),
			)
			.row()
	})

	addNav(keyboard, nav)

	return { message: lines.join('\n'), keyboard }
}

export function buildChooseTokenPage(params: ChooseTokenParams): PageContent {
	const { lines, currencies, tokenActionId, tokenPayload, nav } = params

	const keyboard = new InlineKeyboard()

	currencies.forEach((currency) => {
		const currencyIndex = findCurrencyIndex(currency.id)

		keyboard
			.text(
				currency.symbol,
				buildActionData(tokenActionId, tokenPayload(currencyIndex)),
			)
			.row()
	})

	addNav(keyboard, nav)

	return { message: lines.join('\n'), keyboard }
}

export function chainBreadcrumbSegment(currencies: CurrencyDto[]): string {
	return chainToName(currencies[0].chainAddress.chain)
}
