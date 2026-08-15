import { ChainAddressDtoOutput } from '@rips/api-client'
import { logger } from '@rips/grammy-kit'
import { Chain, isSameChain } from '@rips/shared'
import { fetchSupportedCurrencies } from './utils/api/wrappers'
import { hasFullChainDisplay } from './utils/chain-display'

const REFRESH_INTERVAL_MS = 15 * 60 * 1000

function compare(a: string, b: string): number {
	if (a === b) return 0

	return a < b ? -1 : 1
}

/**
 * Chain references are numeric strings, so comparing them as numbers keeps
 * keyboards in chain-id order rather than listing chain 10 before chain 2.
 */
function compareChainReference(a: string, b: string): number {
	const left = Number(a)
	const right = Number(b)

	if (Number.isNaN(left) || Number.isNaN(right)) return compare(a, b)

	return left - right
}

/**
 * Callback payloads encode a currency or chain as its index into these arrays,
 * so a refresh must not reorder entries that stayed supported. Sorting by chain
 * then address keeps the order a pure function of the membership, independent of
 * the order the backend happens to return.
 */
function sortByChainThenAddress(
	currencies: ChainAddressDtoOutput[],
): ChainAddressDtoOutput[] {
	return [...currencies].sort((a, b) => {
		const byNamespace = compare(a.chain.namespace, b.chain.namespace)

		if (byNamespace !== 0) return byNamespace

		const byReference = compareChainReference(
			a.chain.reference,
			b.chain.reference,
		)

		if (byReference !== 0) return byReference

		return compare(a.address.toLowerCase(), b.address.toLowerCase())
	})
}

function toUniqueChains(currencies: ChainAddressDtoOutput[]): Chain[] {
	const chains: Chain[] = []

	for (const { chain } of currencies) {
		if (chains.some((known) => isSameChain(known, chain))) continue

		chains.push(chain)
	}

	return chains
}

interface Snapshot {
	currencies: ChainAddressDtoOutput[]
	chains: Chain[]
}

let snapshot: Snapshot | undefined

function warnAboutMissingChainDisplay(chains: Chain[]): void {
	const undisplayable = chains.filter((chain) => !hasFullChainDisplay(chain))

	if (undisplayable.length === 0) return

	logger.warn(
		{ chains: undisplayable },
		'Supported chains are missing a name or emoji and will render as raw CAIP-2 identifiers',
	)
}

async function loadSnapshot(): Promise<Snapshot> {
	const currencies = sortByChainThenAddress(
		(await fetchSupportedCurrencies()).map(
			(currency) => currency.chainAddress,
		),
	)

	const chains = toUniqueChains(currencies)

	warnAboutMissingChainDisplay(chains)

	return { currencies, chains }
}

/**
 * Seeds the snapshot from fixtures so the preview bot can render currency and
 * chain keyboards, which go through the same codecs, without a backend.
 */
export function setSupportedCurrencies(
	currencies: ChainAddressDtoOutput[],
): void {
	const sorted = sortByChainThenAddress(currencies)

	snapshot = { currencies: sorted, chains: toUniqueChains(sorted) }
}

/**
 * Must resolve before the bot starts polling, because keyboards cannot be
 * rendered without it. A failure here is fatal by design: serving an empty
 * currency list would silently strip every payment option.
 */
export async function initSupportedCurrencies(): Promise<void> {
	snapshot = await loadSnapshot()

	setInterval(() => {
		void refreshSupportedCurrencies()
	}, REFRESH_INTERVAL_MS).unref()
}

/**
 * Keeps the last good snapshot when the backend is unreachable. The data changes
 * rarely, so a stale list serves users far better than an empty one, and the
 * next tick recovers on its own.
 */
async function refreshSupportedCurrencies(): Promise<void> {
	try {
		snapshot = await loadSnapshot()
	} catch (error) {
		logger.error(
			error,
			'Failed to refresh supported currencies, keeping the last known list',
		)
	}
}

function getSnapshot(): Snapshot {
	if (snapshot === undefined) {
		throw new Error(
			'Supported currencies were read before initSupportedCurrencies() resolved',
		)
	}

	return snapshot
}

export function getSupportedCurrencies(): ChainAddressDtoOutput[] {
	return getSnapshot().currencies
}

export function getSupportedChains(): Chain[] {
	return getSnapshot().chains
}
