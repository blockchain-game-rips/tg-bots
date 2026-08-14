import { ChainAddressDtoOutput } from '@rips/api-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BalanceCache } from '../src/cache/balance-cache'
import { NATIVE_ON_BASE } from '../src/constants'

const fetchBalances = vi.hoisted(() => vi.fn())

vi.mock('../src/utils/api/wrappers', () => ({ fetchBalances }))

const ALICE = '111'

const EMPTY = '0'
const DEPOSITED = '1000'

function balancesOf(amount: string) {
	return (_telegramId: string, chainAddresses: ChainAddressDtoOutput[]) =>
		Promise.resolve(
			chainAddresses.map((chainAddress) => ({
				amount,
				currency: { chainAddress },
			})),
		)
}

async function amountAt(cache: BalanceCache): Promise<string> {
	const balance = await cache.getOne(ALICE, NATIVE_ON_BASE)

	return balance.amount
}

/**
 * The trail replays the handler that opened checkout, so the balance it renders
 * has to come from the cache at replay time rather than from anything the first
 * render captured.
 */
describe('checkout balance freshness after a deposit', () => {
	let cache: BalanceCache

	beforeEach(() => {
		fetchBalances.mockReset()
		fetchBalances.mockImplementation(balancesOf(EMPTY))

		cache = new BalanceCache()
	})

	it('shows the deposit once the balance is invalidated', async () => {
		expect(await amountAt(cache)).toBe(EMPTY)

		fetchBalances.mockImplementation(balancesOf(DEPOSITED))
		await cache.invalidate(ALICE, [NATIVE_ON_BASE])

		expect(await amountAt(cache)).toBe(DEPOSITED)
	})

	it('still shows the deposit when checkout is reopened afterwards', async () => {
		await amountAt(cache)

		fetchBalances.mockImplementation(balancesOf(DEPOSITED))
		await cache.invalidate(ALICE, [NATIVE_ON_BASE])

		await amountAt(cache)

		expect(await amountAt(cache)).toBe(DEPOSITED)
	})

	it('would keep showing the stale balance without invalidation', async () => {
		expect(await amountAt(cache)).toBe(EMPTY)

		fetchBalances.mockImplementation(balancesOf(DEPOSITED))

		expect(await amountAt(cache)).toBe(EMPTY)
	})

	it('costs no request when nothing was invalidated', async () => {
		await amountAt(cache)
		await amountAt(cache)
		await amountAt(cache)

		expect(fetchBalances).toHaveBeenCalledOnce()
	})
})
