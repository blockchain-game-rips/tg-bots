import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../constants'

export type TokenSelection = { tokenIndex: number; chainIndex: number }

export function tokenLabel(selection: TokenSelection): string {
	const token = SUPPORTED_CURRENCIES[selection.tokenIndex]
	const chain = SUPPORTED_CHAINS[selection.chainIndex]
	return `${token.symbol} (${chain.name})`
}
