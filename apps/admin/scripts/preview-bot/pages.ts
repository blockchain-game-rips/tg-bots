import { PageContent } from '../../src/types'

export type PageEntry = {
	description: string
	variants?: string[]
	render: (variant?: string) => PageContent
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

export const pages: Record<string, PageEntry> = {}
