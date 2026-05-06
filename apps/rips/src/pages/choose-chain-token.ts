import { InlineKeyboard } from 'grammy'
import { CurrencyDto } from '../../generated/api-client'
import { SUPPORTED_CHAINS } from '../constants'
import { ActionId, NavIds, PageContent } from '../types'
import { buildActionData } from '../utils/action-data'
import { chainToName } from '../utils/chain'
import { findCurrencyIndex } from '../utils/currency'
import { addNav } from '../utils/keyboard'

type ChooseChainParams<T> = {
	lines: string[]
	chainActionId: ActionId<T>
	chainPayload: (chainIndex: number) => T
	nav: NavIds
}

type ChooseTokenParams<T> = {
	lines: string[]
	currencies: CurrencyDto[]
	tokenActionId: ActionId<T>
	tokenPayload: (currencyIndex: number) => T
	nav: NavIds
}

export function buildChooseChainPage<T>(
	params: ChooseChainParams<T>,
): PageContent {
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

export function buildChooseTokenPage<T>(
	params: ChooseTokenParams<T>,
): PageContent {
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
