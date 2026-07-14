import { ErrorToRender, PayloadCodec } from '@rips/grammy-kit'

export const rawStringCodec: PayloadCodec<string> = {
	encode: (value) => value,
	decode: (raw) => raw,
}

export type SwapAmountPayload =
	| { kind: 'max' }
	| { kind: 'exact'; value: number }

const MAX_TOKEN = 'max'

export const swapAmountCodec: PayloadCodec<SwapAmountPayload> = {
	encode: (payload) =>
		payload.kind === 'max' ? MAX_TOKEN : String(payload.value),

	decode: (raw) => {
		if (raw === MAX_TOKEN) return { kind: 'max' }

		const value = Number(raw)

		if (Number.isNaN(value)) throw new ErrorToRender('Invalid amount')

		return { kind: 'exact', value }
	},
}
