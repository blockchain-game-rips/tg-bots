import { AnyHandlerResult, ErrorToRender } from '@rips/grammy-kit'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/api', () => ({ adminApiKey: 'test-admin-api-key' }))

import { actionIds } from '../src/action-ids'
import {
	submitConfirmSetReferrerCustomFee,
	submitSetReferrerCustomFeeAddress,
} from '../src/action-handlers/execute-set-referrer-custom-fee'
import { Flow } from '../src/flows'
import { EffectType } from '../src/types'

const ADDRESS = '0x1111111111111111111111111111111111111111'
const OTHER_ADDRESS = '0x2222222222222222222222222222222222222222'
const CLEARING_FEE = '0'

const sessionWith = (flow: Flow) => ({ telegramId: 1, flow })

// ActionDef widens every handler to `Promise<HandlerResult> | HandlerResult`,
// but both of these are synchronous, so the tests can treat them as such.
const submitAddress = (payload: string) =>
	submitSetReferrerCustomFeeAddress.handler(
		sessionWith(null),
		payload,
	) as AnyHandlerResult

const submitFee = (payload: string, address = ADDRESS) =>
	submitConfirmSetReferrerCustomFee.handler(
		sessionWith({
			flowType: 'setReferrerCustomFee',
			step: 'fee',
			data: { address },
		}),
		payload,
	) as AnyHandlerResult

const messageOf = (submit: () => AnyHandlerResult): string => {
	try {
		submit()
	} catch (error) {
		if (error instanceof ErrorToRender) return error.messageToRender.text

		throw error
	}

	throw new Error('expected the submission to be rejected')
}

const confirmationTextOf = (payload: string, address = ADDRESS): string => {
	const result = submitFee(payload, address)

	if (!('effect' in result) || result.effect.type !== EffectType.NAVIGATE) {
		throw new Error('expected the submission to navigate to a confirmation')
	}

	return result.effect.page.message.text
}

describe('submitting the referrer address', () => {
	it('carries the address into the fee step', () => {
		expect(submitAddress(ADDRESS)).toMatchObject({
			flow: {
				kind: 'set',
				flow: { step: 'fee', data: { address: ADDRESS } },
			},
		})
	})

	it('asks for the fee instead of confirming straight away', () => {
		const result = submitAddress(ADDRESS)

		expect(result).toMatchObject({
			effect: {
				type: EffectType.ASK,
				onSubmit: actionIds.submitConfirmSetReferrerCustomFee,
			},
		})
	})

	it('rejects a malformed address before asking for a fee', () => {
		expect(messageOf(() => submitAddress('0xnope'))).toBeTruthy()
	})
})

describe('submitting the custom fee', () => {
	it('keeps the address collected in the previous step', () => {
		expect(submitFee('500')).toMatchObject({
			flow: {
				kind: 'set',
				flow: {
					step: 'confirm',
					data: { address: ADDRESS, feeBps: 500 },
				},
			},
		})
	})

	it('reads the address from the session rather than the fee reply', () => {
		expect(submitFee('500', OTHER_ADDRESS)).toMatchObject({
			flow: { kind: 'set', flow: { data: { address: OTHER_ADDRESS } } },
		})
	})

	it('shows the referrer and the fee on the confirmation screen', () => {
		const text = confirmationTextOf('500')

		expect(text).toContain(ADDRESS)
		expect(text).toContain('500')
	})

	it('describes a zero fee as clearing the override, not as a zero rate', () => {
		expect(confirmationTextOf(CLEARING_FEE).toLowerCase()).toContain(
			'clear',
		)
	})

	it('warns that a non-zero fee overrides the tier rules', () => {
		expect(confirmationTextOf('500').toLowerCase()).toContain('overrid')
	})

	it('rejects a fee that is not a whole number', () => {
		expect(messageOf(() => submitFee('5.5'))).toBeTruthy()
	})

	it('rejects a fee above the whole fee before reaching the confirmation', () => {
		expect(messageOf(() => submitFee('50000'))).toBeTruthy()
	})

	it('rejects a fee reply that arrived outside the flow', () => {
		const stale = () =>
			submitConfirmSetReferrerCustomFee.handler(
				sessionWith(null),
				'500',
			) as AnyHandlerResult

		expect(messageOf(stale)).toBeTruthy()
	})
})
