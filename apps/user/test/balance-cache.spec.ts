import { ChainAddressDtoOutput } from '@rips/api-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BalanceCache } from '../src/cache/balance-cache'
import {
	BASE_CHAIN,
	ETHEREUM_CHAIN,
	NATIVE_ON_BASE,
	withNative,
} from '../src/constants'

const fetchBalances = vi.hoisted(() => vi.fn())

vi.mock('../src/utils/api/wrappers', () => ({ fetchBalances }))

const ALICE = 111
const BOB = 222

const USDC_ON_BASE: ChainAddressDtoOutput = {
	address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
	chain: BASE_CHAIN,
}

const NATIVE_ON_ETHEREUM: ChainAddressDtoOutput = {
	address: '0x0000000000000000000000000000000000000000',
	chain: ETHEREUM_CHAIN,
}

function balanceOf(chainAddress: ChainAddressDtoOutput, amount: string) {
	return { amount, currency: { chainAddress } }
}

/** Echoes back a balance for every address asked for. */
function respondWithAmount(amount: string) {
	return (_telegramId: number, chainAddresses: ChainAddressDtoOutput[]) =>
		Promise.resolve(
			chainAddresses.map((chainAddress) =>
				balanceOf(chainAddress, amount),
			),
		)
}

function isChainAddresses(value: unknown): value is ChainAddressDtoOutput[] {
	return (
		Array.isArray(value) &&
		value.every(
			(entry) =>
				typeof entry === 'object' &&
				entry !== null &&
				'address' in entry &&
				'chain' in entry,
		)
	)
}

function requestedAddresses(callIndex: number): ChainAddressDtoOutput[] {
	const call: unknown = fetchBalances.mock.calls[callIndex]

	if (!Array.isArray(call)) throw new Error(`no call at ${String(callIndex)}`)

	const chainAddresses: unknown = call[1]

	if (!isChainAddresses(chainAddresses)) {
		throw new Error('call did not receive chain addresses')
	}

	return chainAddresses
}

describe('BalanceCache', () => {
	let cache: InstanceType<typeof BalanceCache>

	beforeEach(() => {
		fetchBalances.mockReset()
		fetchBalances.mockImplementation(respondWithAmount('100'))

		cache = new BalanceCache()
	})

	it('fetches on a cold read', async () => {
		const balances = await cache.get(ALICE, [NATIVE_ON_BASE])

		expect(fetchBalances).toHaveBeenCalledOnce()
		expect(balances).toEqual([balanceOf(NATIVE_ON_BASE, '100')])
	})

	it('serves a warm read without fetching', async () => {
		await cache.get(ALICE, [NATIVE_ON_BASE, USDC_ON_BASE])
		await cache.get(ALICE, [NATIVE_ON_BASE, USDC_ON_BASE])

		expect(fetchBalances).toHaveBeenCalledOnce()
	})

	it('asks only for the addresses it is missing', async () => {
		await cache.get(ALICE, [NATIVE_ON_BASE])
		await cache.get(ALICE, [NATIVE_ON_BASE, USDC_ON_BASE])

		expect(requestedAddresses(1)).toEqual([USDC_ON_BASE])
	})

	it('refetches only the invalidated address', async () => {
		await cache.get(ALICE, [NATIVE_ON_BASE, USDC_ON_BASE])

		await cache.invalidate(ALICE, [NATIVE_ON_BASE])

		fetchBalances.mockImplementation(respondWithAmount('900'))

		const balances = await cache.get(ALICE, [NATIVE_ON_BASE, USDC_ON_BASE])

		expect(requestedAddresses(1)).toEqual([NATIVE_ON_BASE])
		expect(balances).toEqual([
			balanceOf(NATIVE_ON_BASE, '900'),
			balanceOf(USDC_ON_BASE, '100'),
		])
	})

	it('keeps one user warm when another is invalidated', async () => {
		await cache.get(ALICE, [NATIVE_ON_BASE])
		await cache.get(BOB, [NATIVE_ON_BASE])

		await cache.invalidate(BOB, [NATIVE_ON_BASE])

		await cache.get(ALICE, [NATIVE_ON_BASE])

		expect(fetchBalances).toHaveBeenCalledTimes(2)
	})

	it('does not confuse the same address held by different users', async () => {
		fetchBalances.mockImplementation(respondWithAmount('1'))
		await cache.get(ALICE, [NATIVE_ON_BASE])

		fetchBalances.mockImplementation(respondWithAmount('2'))
		const bobBalances = await cache.get(BOB, [NATIVE_ON_BASE])

		expect(bobBalances).toEqual([balanceOf(NATIVE_ON_BASE, '2')])
	})

	it('treats the same address on different chains as different keys', async () => {
		await cache.get(ALICE, [NATIVE_ON_BASE])
		await cache.get(ALICE, [NATIVE_ON_ETHEREUM])

		expect(fetchBalances).toHaveBeenCalledTimes(2)
		expect(requestedAddresses(1)).toEqual([NATIVE_ON_ETHEREUM])
	})

	it('treats a differently cased address as the same key', async () => {
		await cache.get(ALICE, [USDC_ON_BASE])

		await cache.get(ALICE, [
			{ ...USDC_ON_BASE, address: USDC_ON_BASE.address.toLowerCase() },
		])

		expect(fetchBalances).toHaveBeenCalledOnce()
	})

	it('drops the native currency alongside the one that was spent', async () => {
		await cache.get(ALICE, [USDC_ON_BASE, NATIVE_ON_BASE])

		await cache.invalidate(ALICE, withNative(USDC_ON_BASE))

		await cache.get(ALICE, [USDC_ON_BASE, NATIVE_ON_BASE])

		expect(requestedAddresses(1)).toEqual([USDC_ON_BASE, NATIVE_ON_BASE])
	})

	it('returns a pair without widening either balance', async () => {
		const [first, second] = await cache.getPair(
			ALICE,
			USDC_ON_BASE,
			NATIVE_ON_BASE,
		)

		expect(fetchBalances).toHaveBeenCalledOnce()
		expect([first.amount, second.amount]).toEqual(['100', '100'])
	})

	it('reads a pair in one request', async () => {
		await cache.getPair(ALICE, USDC_ON_BASE, NATIVE_ON_BASE)

		expect(requestedAddresses(0)).toEqual([USDC_ON_BASE, NATIVE_ON_BASE])
	})

	it('throws rather than shifting values when one is missing', async () => {
		fetchBalances.mockImplementation(
			(_telegramId: number, chainAddresses: ChainAddressDtoOutput[]) =>
				Promise.resolve(
					chainAddresses
						.filter(
							(chainAddress) =>
								chainAddress.address !== NATIVE_ON_BASE.address,
						)
						.map((chainAddress) => balanceOf(chainAddress, '100')),
				),
		)

		await expect(
			cache.get(ALICE, [NATIVE_ON_BASE, USDC_ON_BASE]),
		).rejects.toThrow()
	})

	it('returns a single balance directly', async () => {
		const balance = await cache.getOne(ALICE, NATIVE_ON_BASE)

		expect(balance).toEqual(balanceOf(NATIVE_ON_BASE, '100'))
	})

	it('throws when a requested balance is missing from the response', async () => {
		fetchBalances.mockResolvedValue([])

		await expect(cache.getOne(ALICE, NATIVE_ON_BASE)).rejects.toThrow()
	})
})
