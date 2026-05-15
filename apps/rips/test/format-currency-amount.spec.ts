import { CurrencyAmountDto } from '../generated/api-client'
import { currencyAmountDisplayParts } from '../src/utils/format/currency'

function makeCurrencyAmount(
	amount: string,
	decimals: number,
	priceUsd: number,
	symbol: string,
): CurrencyAmountDto {
	return {
		amount,
		currency: {
			decimals,
			priceUsd,
			symbol,
		} as CurrencyAmountDto['currency'],
	}
}

describe('formatCurrencyAmount', () => {
	describe('displayUsdAmount', () => {
		it('returns $0 when amount is zero', () => {
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('0', 18, 2000, 'ETH'),
			)
			expect(result.displayUsdAmount).toBe('$0')
		})

		it('returns formatted usd when above $0.01', () => {
			// 0.01 ETH @ $2000 = $20.00
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('10000000000000000', 18, 2000, 'ETH'),
			)
			expect(result.displayUsdAmount).toBe('$20.00')
		})

		it('returns <$0.01 when usd value is below minimum', () => {
			// 1 wei @ $2000 = $0.000000000000002
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('1', 18, 2000, 'ETH'),
			)
			expect(result.displayUsdAmount).toBe('<$0.01')
		})
	})

	describe('displayAmount and symbol', () => {
		it('returns 0 and symbol when amount is zero', () => {
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('0', 18, 2000, 'ETH'),
			)
			expect(result.displayAmount).toBe('0')
			expect(result.symbol).toBe('ETH')
		})

		it('formats ETH with correct decimals based on price', () => {
			// ETH @ $2000: min unit = $0.01 / 2000 = 0.000005 → 6 decimals
			// 0.001234 ETH
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('1234000000000000', 18, 2000, 'ETH'),
			)
			expect(result.displayAmount).toBe('0.001234')
			expect(result.symbol).toBe('ETH')
		})

		it('formats BTC with more decimals due to high price', () => {
			// BTC @ $90000: min unit = $0.01 / 90000 ≈ 0.0000001 → 7 decimals
			// 0.0000001 BTC
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('10', 8, 90000, 'BTC'),
			)
			expect(result.displayAmount).toBe('0.0000001')
			expect(result.symbol).toBe('BTC')
		})

		it('formats USDC with 2 decimals', () => {
			// USDC @ $1: min unit = $0.01 / 1 = 0.01 → 2 decimals
			// 1.50 USDC
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('1500000', 6, 1, 'USDC'),
			)
			expect(result.displayAmount).toBe('1.50')
			expect(result.symbol).toBe('USDC')
		})

		it('handles USDT slightly above $1 with 3 decimals', () => {
			// USDT @ $1.02: min unit = $0.01 / 1.02 ≈ 0.0098 → ceil = 3 decimals
			// 1.000 USDT
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('1000000', 6, 1.02, 'USDT'),
			)
			expect(result.displayAmount).toBe('1.000')
			expect(result.symbol).toBe('USDT')
		})

		it('returns <minDisplayAmount when below displayable threshold', () => {
			// ETH @ $2000 → 6 decimals → min = 0.000001 ETH
			// 0.0000005 ETH → below threshold
			const result = currencyAmountDisplayParts(
				makeCurrencyAmount('500000000000', 18, 2000, 'ETH'),
			)
			expect(result.displayAmount).toBe('<0.000001')
			expect(result.symbol).toBe('ETH')
		})
	})
})
