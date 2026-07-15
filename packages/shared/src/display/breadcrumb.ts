export function breadcrumb(
	prefix: string,
	...segments: (string | undefined)[]
): string {
	const parts = [prefix, ...segments.filter((s) => s !== undefined)]
	return `<b>${parts.join(' › ')}</b>`
}
