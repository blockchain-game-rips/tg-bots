const FEE_BASE = 10000

export function formatPercent(basisPoints: number): string {
	return `${((basisPoints / FEE_BASE) * 100).toFixed(2)}%`
}
