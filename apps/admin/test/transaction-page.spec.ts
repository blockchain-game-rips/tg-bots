import { AdminTransactionResponseDtoOutput } from '@rips/api-client'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/api', () => ({ adminApiKey: 'test-admin-api-key' }))

import { TransactionPage } from '../src/pages/transaction-page'

const SUCCESS_TITLE = 'Default fee set to 50 bp'
const GERUND = 'Setting the default fee'

const transaction = {
	id: '0xabc',
	chain: { namespace: 'eip155', reference: '8453' },
	senderAddress: '0xsender',
	cost: {
		amount: '1000',
		currency: {
			id: 'eip155:8453/native',
			chainAddress: {
				address: 'native',
				chain: { namespace: 'eip155', reference: '8453' },
			},
			decimals: 18,
			symbol: 'ETH',
			name: 'Ether',
			priceUsd: 3000,
		},
	},
}

const render = (tx: AdminTransactionResponseDtoOutput) =>
	TransactionPage.render({ succeeded: SUCCESS_TITLE, operation: GERUND }, tx)
		.message.text

describe('rendering a config write', () => {
	it('shows the transaction when it succeeded', () => {
		const text = render({
			transaction: { status: 'succeeded', transaction },
		})

		expect(text).toContain(SUCCESS_TITLE)
		expect(text).toContain('0xabc')
	})

	it('says nothing was sent and never claims the change happened', () => {
		const text = render({ transaction: { status: 'not-sent' } })

		expect(text).not.toContain(SUCCESS_TITLE)
		expect(text).toContain(`${GERUND} didn’t go through`)
		expect(text).toContain('Nothing was sent')
	})

	it('says the fee was charged when it reverted', () => {
		const text = render({
			transaction: { status: 'reverted', transaction },
		})

		expect(text).not.toContain(SUCCESS_TITLE)
		expect(text).toContain('failed on-chain')
		expect(text).toContain('network fee was still charged')
	})

	it('tells the admin to check the state when the outcome is unknown', () => {
		const text = render({
			transaction: { status: 'unknown', transactionId: null },
		})

		expect(text).not.toContain(SUCCESS_TITLE)
		expect(text).toContain('couldn’t confirm')
		expect(text).toContain('Check the current state')
	})
})
