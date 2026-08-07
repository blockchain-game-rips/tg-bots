// TODO: zap endpoints were removed from the API. These wrappers reuse the
// purchase endpoints and reshape their result to the old zap response types so
// the compiler stays quiet until the zap flow is rewritten. Do not ship — the
// returned data does not actually contain zapId/amountIn/fee etc.
import {
	BuyEntriesZapResponseDtoOutput,
	QuoteZapResponseDtoOutput,
	ripsControllerBuyEntriesPurchase,
	ripsControllerQuotePurchase,
} from '@rips/api-client'

type EnterZapArgs = Parameters<typeof ripsControllerBuyEntriesPurchase>
type QuoteZapArgs = Parameters<typeof ripsControllerQuotePurchase>

export async function ripsControllerEnterZap(
	...args: EnterZapArgs
): Promise<{ data: BuyEntriesZapResponseDtoOutput }> {
	const res = await ripsControllerBuyEntriesPurchase(...args)

	return { data: res.data as unknown as BuyEntriesZapResponseDtoOutput }
}

export async function ripsControllerQuoteZap(
	...args: QuoteZapArgs
): Promise<{ data: QuoteZapResponseDtoOutput }> {
	const res = await ripsControllerQuotePurchase(...args)

	return { data: res.data as unknown as QuoteZapResponseDtoOutput }
}
