import {
	BoundAction,
	executeEffectOrDisplayError,
	Message,
	PageContent,
	Workspace,
} from '@rips/grammy-kit'
import { FormattedString } from '@grammyjs/parse-mode'
import { Api, InlineKeyboard } from 'grammy'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
	ripsControllerBuyEntriesPurchase: vi.fn(),
	ripsControllerBuyEntriesZapCrosschain: vi.fn(),
	ripsControllerBuyEntriesZapSamechain: vi.fn(),
	ripsControllerGetZapResult: vi.fn(),
}))

const renderCheckoutPage = vi.hoisted(() => vi.fn())
const presetCache = vi.hoisted(() => ({ getOne: vi.fn() }))
const balanceCache = vi.hoisted(() => ({ invalidate: vi.fn() }))

vi.mock('@rips/api-client', async (importOriginal) => ({
	...(await importOriginal<object>()),
	...api,
}))

// the success page reaches the action registry, which needs every action bound
vi.mock('../src/pages/play/enter-success-page', () => ({
	EnterSuccessPage: {
		render: () => ({
			message: new FormattedString('entered', []),
			keyboard: new InlineKeyboard(),
		}),
	},
}))

vi.mock('../src/action-handlers/play/enter/open-enter-checkout', () => ({
	renderCheckoutPage,
}))

import { NATIVE_ON_BASE } from '../src/constants'

vi.mock('../src/cache/preset-cache', () => ({ presetCache }))
vi.mock('../src/cache/balance-cache', () => ({ balanceCache }))
vi.mock('../src/utils/api/wrappers', () => ({ fetchRip: vi.fn() }))
vi.mock('../src/utils/api/key', () => ({
	userApiKey: () => 'test-user-api-key',
}))

import { executeEnter } from '../src/action-handlers/play/enter/execute-enter'

const CHAT_ID = 100
const MESSAGE_ID = 7

const CHECKOUT_TEXT = 'checkout with fresh balances'
const STALE_TEXT = 'checkout from before the attempt'

const page = (text: string): PageContent => ({
	message: new FormattedString(text, []),
	keyboard: new InlineKeyboard(),
})

const message: Message = { messageId: MESSAGE_ID, hasMedia: false }

const editedTexts: string[] = []

const fakeApi = {
	editMessageText: (_chatId: number, _messageId: number, text: string) => {
		editedTexts.push(text)

		return Promise.resolve({ message_id: MESSAGE_ID })
	},
	sendMessage: () => Promise.resolve({ message_id: MESSAGE_ID }),
	deleteMessages: () => Promise.resolve(true),
}

const TELEGRAM_ID = 1

const workspace = (payChainAddress: object): Workspace => ({
	messageId: MESSAGE_ID,
	lastInteraction: 0,
	lastAsk: null,
	flow: {
		flowType: 'enter',
		step: 'at-checkout',
		data: {
			presetId: 1,
			entryCount: 2,
			payChainAddress,
		},
	},
	lastNavigatedPage: page(STALE_TEXT),
	history: [],
})

async function runEnter(
	payChainAddress: object = NATIVE_ON_BASE,
): Promise<string> {
	const actions: Record<string, BoundAction> = {
		enter: {
			decode: (raw: string) => raw,
			handler: (session) => executeEnter.handler(session, undefined),
		},
	}

	await executeEffectOrDisplayError({
		api: fakeApi as unknown as Api,
		chatId: CHAT_ID,
		telegramId: TELEGRAM_ID,
		message,
		workspace: workspace(payChainAddress),
		actions,
		action: { actionId: 'enter', payload: undefined },
		fallbackPage: page('fallback'),
	})

	// the error page is delivered without being awaited
	await Promise.resolve()
	await Promise.resolve()

	return editedTexts[editedTexts.length - 1] ?? ''
}

const purchaseOf = (status: string) => ({
	data: { purchase: { status, transactionId: null } },
})

describe('reporting what happened to a direct entry', () => {
	beforeEach(() => {
		editedTexts.length = 0

		vi.clearAllMocks()

		presetCache.getOne.mockResolvedValue({ preset: { id: 1 } })
		balanceCache.invalidate.mockResolvedValue(undefined)
		renderCheckoutPage.mockResolvedValue(page(CHECKOUT_TEXT))
	})

	it('says the funds are untouched when nothing was sent', async () => {
		api.ripsControllerBuyEntriesPurchase.mockResolvedValue(
			purchaseOf('not-sent'),
		)

		const text = await runEnter()

		expect(text).toContain('Nothing was sent')
		expect(text).toContain('your funds are untouched')
	})

	it('says the fee was charged when the transaction reverted', async () => {
		api.ripsControllerBuyEntriesPurchase.mockResolvedValue(
			purchaseOf('reverted'),
		)

		const text = await runEnter()

		expect(text).toContain('failed on-chain')
		expect(text).toContain('network fee was still charged')
	})

	it('warns about entering twice when the outcome is unknown', async () => {
		api.ripsControllerBuyEntriesPurchase.mockResolvedValue(
			purchaseOf('unknown'),
		)

		const text = await runEnter()

		expect(text).toContain('couldn’t confirm')
		expect(text).toContain('end up entering twice')
	})

	it('treats a thrown call as an unknown outcome', async () => {
		api.ripsControllerBuyEntriesPurchase.mockRejectedValue(
			new Error('network down'),
		)

		const text = await runEnter()

		expect(text).toContain('couldn’t confirm')
	})

	it('shows the failure over a freshly rendered checkout', async () => {
		api.ripsControllerBuyEntriesPurchase.mockResolvedValue(
			purchaseOf('not-sent'),
		)

		const text = await runEnter()

		expect(text).toContain(CHECKOUT_TEXT)
		expect(text).not.toContain(STALE_TEXT)
	})

	it('warns the screen is stale when it cannot be re-rendered', async () => {
		api.ripsControllerBuyEntriesPurchase.mockResolvedValue(
			purchaseOf('not-sent'),
		)
		renderCheckoutPage.mockRejectedValue(new Error('quote endpoint down'))

		const text = await runEnter()

		expect(text).toContain(STALE_TEXT)
		expect(text).toContain('Couldn’t refresh this screen')
	})
})

const USDC_ON_ARBITRUM = {
	address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
	chain: { namespace: 'eip155', reference: '42161' },
}

const zapSubmitted = {
	data: {
		approval: null,
		zap: {
			status: 'succeeded',
			transaction: {
				id: '0xsrc',
				chain: USDC_ON_ARBITRUM.chain,
				senderAddress: '0xsender',
				cost: {
					amount: '1',
					currency: { chainAddress: USDC_ON_ARBITRUM },
				},
			},
			result: {
				zapId: 'zap-1',
				amountIn: {
					amount: '1',
					currency: { chainAddress: USDC_ON_ARBITRUM },
				},
				fee: {
					amount: '1',
					currency: { chainAddress: USDC_ON_ARBITRUM },
				},
				durationMs: 1000,
			},
		},
	},
}

const zapResult = (outcome: object) => ({
	data: {
		pending: null,
		cancelled: null,
		failed: null,
		success: null,
		...outcome,
	},
})

describe('reporting what happened to a crosschain entry', () => {
	beforeEach(() => {
		editedTexts.length = 0

		vi.clearAllMocks()

		presetCache.getOne.mockResolvedValue({ preset: { id: 1 } })
		balanceCache.invalidate.mockResolvedValue(undefined)
		renderCheckoutPage.mockResolvedValue(page(CHECKOUT_TEXT))

		api.ripsControllerBuyEntriesZapCrosschain.mockResolvedValue(
			zapSubmitted,
		)
	})

	it('says where the refund is going when the zap failed', async () => {
		api.ripsControllerGetZapResult.mockResolvedValue(
			zapResult({
				failed: {
					refund: {
						amount: '2500000',
						currency: {
							chainAddress: USDC_ON_ARBITRUM,
							decimals: 6,
							symbol: 'USDC',
							priceUsd: 1,
						},
					},
				},
			}),
		)

		const text = await runEnter(USDC_ON_ARBITRUM)

		expect(text).toContain('on its way back to your wallet')
		expect(text).toContain('USDC')
	})

	it('admits it cannot say more when the zap was cancelled', async () => {
		api.ripsControllerGetZapResult.mockResolvedValue(
			zapResult({ cancelled: {} }),
		)

		const text = await runEnter(USDC_ON_ARBITRUM)

		expect(text).toContain('If any funds were taken')
		expect(text).toContain('a few minutes')
	})

	it('keeps polling through a failed poll rather than giving up', async () => {
		api.ripsControllerGetZapResult
			.mockRejectedValueOnce(new Error('blip'))
			.mockResolvedValue(zapResult({ cancelled: {} }))

		const text = await runEnter(USDC_ON_ARBITRUM)

		expect(api.ripsControllerGetZapResult).toHaveBeenCalledTimes(2)
		expect(text).toContain('If any funds were taken')
	})
})
