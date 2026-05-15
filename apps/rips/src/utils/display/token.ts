import { CurrencyAmountDto } from '../../../generated/api-client'
import { chainToName } from '../chain'

export function tokenLabel(amount: CurrencyAmountDto): string {
	const { currency } = amount
	return `${currency.symbol} (${chainToName(currency.chainAddress.chain)})`
}
