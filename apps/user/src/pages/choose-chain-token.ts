import { ChainAddressDto, CurrencyDto } from '@rips/api-client'
import { addNav, buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { SUPPORTED_CHAINS } from '../constants'
import { ActionId, Chain, NavIds, PageContent } from '../types'
import { chainToName } from '../utils/chain'

interface ChooseChainParams<T> {
	lines: Line[]
	chainActionId: ActionId<T>
	chainPayload: (chain: Chain) => T
	nav: NavIds
}

interface ChooseTokenParams<T> {
	lines: Line[]
	currencies: CurrencyDto[]
	tokenActionId: ActionId<T>
	tokenPayload: (currency: CurrencyDto) => T
	nav: NavIds
}

// TODO: refactor: not pure (reads SUPPORTED_CHAINS) and hard to follow
export function buildChooseChainPage<T>(
	params: ChooseChainParams<T>,
): PageContent {
	const { lines, chainActionId, chainPayload, nav } = params

	const keyboard = new InlineKeyboard()

	SUPPORTED_CHAINS.forEach((chain) => {
		keyboard
			.text(
				chainToName(chain),
				buildActionData(chainActionId, chainPayload(chain)),
			)
			.row()
	})

	addNav(keyboard, nav)

	return { message: joinLines(lines), keyboard }
}

export function buildChainKeyboard(
	chains: Chain[],
	onChainSelectedActionId: ActionId<Chain>,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	appendChainButtonRows(keyboard, chains, onChainSelectedActionId)

	return keyboard
}

export function appendChainButtonRows(
	keyboard: InlineKeyboard,
	chains: Chain[],
	onChainSelectedActionId: ActionId<Chain>,
) {
	chains.forEach((chain) => {
		keyboard
			.text(
				chainToName(chain),
				buildActionData(onChainSelectedActionId, chain),
			)
			.row()
	})
}

export function buildTokenKeyboard(
	currencies: CurrencyDto[],
	onTokenSelectedActionId: ActionId<ChainAddressDto>,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	appendTokenButtonRows(keyboard, currencies, onTokenSelectedActionId)

	return keyboard
}

export function appendTokenButtonRows(
	keyboard: InlineKeyboard,
	currencies: CurrencyDto[],
	onTokenSelectedActionId: ActionId<ChainAddressDto>,
) {
	currencies.forEach((currency) => {
		keyboard
			.text(
				currency.symbol,
				buildActionData(onTokenSelectedActionId, currency.chainAddress),
			)
			.row()
	})
}

export function buildChooseTokenPage<T>(
	params: ChooseTokenParams<T>,
): PageContent {
	const { lines, currencies, tokenActionId, tokenPayload, nav } = params

	const keyboard = new InlineKeyboard()

	currencies.forEach((currency) => {
		keyboard
			.text(
				currency.symbol,
				buildActionData(tokenActionId, tokenPayload(currency)),
			)
			.row()
	})

	addNav(keyboard, nav)

	return { message: joinLines(lines), keyboard }
}

export function chainBreadcrumbSegment(currencies: CurrencyDto[]): string {
	const first = currencies[0]

	if (first === undefined) throw new Error('No currencies provided')

	return chainToName(first.chainAddress.chain)
}
