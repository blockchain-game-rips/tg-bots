import { PayloadCodec } from '@rips/grammy-kit'

export const rawStringCodec: PayloadCodec<string> = {
	encode: (value) => value,
	decode: (raw) => raw,
}
