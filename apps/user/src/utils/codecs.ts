import { ErrorToRender, logger, PayloadCodec } from '@rips/grammy-kit'
import { parseEntryCount, parseEvmAddressOrUndefined } from '@rips/shared'

const NO_REFERRER = ''

/**
 * The only payload in the app that a stranger can author, since it arrives from
 * a referral link rather than from a button the bot encoded. A malformed
 * address is dropped rather than reported: the invitee did nothing wrong, and
 * blocking onboarding over it costs more than the lost referral credit.
 */
export const referrerAddressCodec: PayloadCodec<string | undefined> = {
	encode: (referrerAddress) => referrerAddress ?? NO_REFERRER,

	decode: (raw) => {
		if (raw === NO_REFERRER) return undefined

		const referrerAddress = parseEvmAddressOrUndefined(raw)

		if (referrerAddress === undefined)
			logger.warn({ raw }, 'Discarded malformed referrer address')

		return referrerAddress
	},
}

export const entryCountCodec: PayloadCodec<number> = {
	encode: (entryCount) => entryCount.toString(),
	decode: (raw) => parseEntryCount(raw),
}

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
