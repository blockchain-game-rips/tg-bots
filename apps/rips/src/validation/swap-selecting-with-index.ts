import { ChainAddressDto } from '../../generated/api-client'
import { SwapSelecting } from '../flows'
import { Chain } from '../types'
import { ErrorToRender } from '../utils/error-to-render'
import { parseChain } from './chain-index'
import { parseCurrencyChainAddress } from './currency-index'
import { parseSwapSelecting } from './swap-selecting'

export type SelectingWithValue<T> = { selecting: SwapSelecting; value: T }

function splitSelectingPayload(raw: string): [SwapSelecting, string] {
	const separatorIndex = raw.indexOf(':')
	if (separatorIndex === -1) throw new ErrorToRender('Invalid payload')

	const selecting = parseSwapSelecting(raw.slice(0, separatorIndex))
	const rest = raw.slice(separatorIndex + 1)

	return [selecting, rest]
}

export function encodeSelectingWithIndex(
	selecting: SwapSelecting,
	index: number,
): string {
	return `${selecting}:${index}`
}

export function parseSelectingWithCurrency(
	raw: string,
): SelectingWithValue<ChainAddressDto> {
	const [selecting, rest] = splitSelectingPayload(raw)
	return { selecting, value: parseCurrencyChainAddress(rest) }
}

export function parseSelectingWithChain(
	raw: string,
): SelectingWithValue<Chain> {
	const [selecting, rest] = splitSelectingPayload(raw)
	return { selecting, value: parseChain(rest) }
}
