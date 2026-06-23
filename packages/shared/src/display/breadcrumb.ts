function breadcrumb(
	prefix: string,
	...segments: (string | undefined)[]
): string {
	const parts = [prefix, ...segments.filter((s) => s !== undefined)]
	return `<b>${parts.join(' › ')}</b>`
}

export function withdrawBreadcrumb(
	...segments: (string | undefined)[]
): string {
	return breadcrumb('💸 Withdraw', ...segments)
}

export function swapBreadcrumb(...segments: (string | undefined)[]): string {
	return breadcrumb('🔄 Swap', ...segments)
}

export function buyEntriesBreadcrumb(
	...segments: (string | undefined)[]
): string {
	return breadcrumb('🎮 Buy Entries', ...segments)
}
