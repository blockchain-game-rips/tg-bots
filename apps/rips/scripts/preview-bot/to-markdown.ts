import fs from 'fs'
import { PageEntry, pages } from './pages'

export function pagesToMarkdown(pages: Record<string, PageEntry>): string {
	return Object.entries(pages)
		.map(([name, page]) => {
			const title = capitalize(name)
			return `## ${title}\n\n${page.description}`
		})
		.join('\n\n')
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

function main() {
	const mdContent = pagesToMarkdown(pages)
	const generatedFolder = './scripts/preview-bot/generated'

	fs.mkdirSync(generatedFolder, { recursive: true })
	fs.writeFileSync(`${generatedFolder}/pages.md`, mdContent)
}

void main()
