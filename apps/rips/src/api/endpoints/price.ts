import { apiFetch } from '../client'
import { Price, priceSchema } from '../schemas'

export function getMainCurrencyPrice(): Promise<Price> {
	return apiFetch('/price/main-currency', priceSchema)
}
