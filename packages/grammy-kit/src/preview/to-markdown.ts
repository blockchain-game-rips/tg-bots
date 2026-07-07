import fs from 'fs'
import { PageEntry } from './page-entry'

function pagesToMarkdown(pages: Record<string, PageEntry>): string {
	return Object.entries(pages)
		.map(([name, page]) => {
			return `## ${name}\n\n${page.description}`
		})
		.join('\n\n')
}

export function writePagesMarkdown(
	pages: Record<string, PageEntry>,
	outDir: string,
): void {
	const mdContent = pagesToMarkdown(pages)

	fs.mkdirSync(outDir, { recursive: true })
	fs.writeFileSync(`${outDir}/pages.md`, mdContent)
}
