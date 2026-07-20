import { PageContent } from '../types'

export interface PageEntry {
	description: string
	variants?: string[]
	render: (variant?: string) => PageContent | Promise<PageContent>
}

export class VariantError extends Error {
	constructor(
		readonly received: string | undefined,
		readonly available: string[],
	) {
		super()
	}
}

export function resolveVariant(
	entry: PageEntry,
	variant: string | undefined,
): string {
	if (!entry.variants?.length) return variant ?? ''

	const match = entry.variants.find((v) => v === variant)

	if (!match) throw new VariantError(variant, entry.variants)

	return match
}
