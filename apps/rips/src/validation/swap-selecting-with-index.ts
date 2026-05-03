import { ChainAddressDto } from '../../generated/api-client'
import { SwapSelecting } from '../flows'
import { Chain } from '../types'
import { ErrorToRender } from '../utils/error-to-render'
import { parseChain } from './chain-index'
import { parseCurrencyChainAddress } from './currency-index'
import { parseSwapSelecting } from './swap-selecting'

type SelectingWithIndex<T> = { selecting: SwapSelecting; value: T }

function splitSelectingPayload(
	payload: string | undefined,
): [SwapSelecting, string] {
	if (payload === undefined) throw new ErrorToRender('Missing payload')

	const separatorIndex = payload.indexOf(':')
	if (separatorIndex === -1) throw new ErrorToRender('Invalid payload')

	const selecting = parseSwapSelecting(payload.slice(0, separatorIndex))
	const rest = payload.slice(separatorIndex + 1)

	return [selecting, rest]
}

export function parseSelectingWithCurrency(
	payload: string | undefined,
): SelectingWithIndex<ChainAddressDto> {
	const [selecting, rest] = splitSelectingPayload(payload)
	return { selecting, value: parseCurrencyChainAddress(rest) }
}

export function parseSelectingWithChain(
	payload: string | undefined,
): SelectingWithIndex<Chain> {
	const [selecting, rest] = splitSelectingPayload(payload)
	return { selecting, value: parseChain(rest) }
}
