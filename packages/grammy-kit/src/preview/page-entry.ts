import { PageContent } from '../types'

export interface PageEntry {
	description: string
	variants?: string[]
	render: (variant?: string) => PageContent | Promise<PageContent>
}

export interface PageSection {
	title: string
	prefixes: string[]
}

interface GroupedPages {
	section: PageSection | undefined
	pages: [string, PageEntry][]
}

const UNGROUPED_SECTION_TITLE = 'Other'

export function groupPagesBySection(
	pages: Record<string, PageEntry | undefined>,
	sections: PageSection[],
): GroupedPages[] {
	const entries = Object.entries(pages).filter(
		(entry): entry is [string, PageEntry] => entry[1] !== undefined,
	)

	const matchSection = (name: string): PageSection | undefined =>
		sections.find((section) =>
			section.prefixes.some((prefix) => name.startsWith(prefix)),
		)

	const groups: GroupedPages[] = sections.map((section) => ({
		section,
		pages: [],
	}))

	const ungrouped: GroupedPages = {
		section: { title: UNGROUPED_SECTION_TITLE, prefixes: [] },
		pages: [],
	}

	for (const entry of entries) {
		const section = matchSection(entry[0])

		const group = groups.find((g) => g.section === section) ?? ungrouped

		group.pages.push(entry)
	}

	const nonEmptyGroups = groups.filter((group) => group.pages.length > 0)

	if (ungrouped.pages.length > 0) nonEmptyGroups.push(ungrouped)

	return nonEmptyGroups
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
