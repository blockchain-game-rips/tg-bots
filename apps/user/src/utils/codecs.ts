import { ErrorToRender, PayloadCodec } from '@rips/grammy-kit'

export type AmountPayload = { kind: 'max' } | { kind: 'exact'; value: number }

const MAX_TOKEN = 'max'

export const amountCodec: PayloadCodec<AmountPayload> = {
	encode: (payload) =>
		payload.kind === 'max' ? MAX_TOKEN : String(payload.value),

	decode: (raw) => {
		if (raw === MAX_TOKEN) return { kind: 'max' }

		const value = Number(raw)

		if (Number.isNaN(value)) throw new ErrorToRender('Invalid amount')

		return { kind: 'exact', value }
	},
}
