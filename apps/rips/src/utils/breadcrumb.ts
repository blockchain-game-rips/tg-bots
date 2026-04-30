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

export function buyTicketsBreadcrumb(
	...segments: (string | undefined)[]
): string {
	return breadcrumb('🎮 Buy Tickets', ...segments)
}
