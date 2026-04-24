import { PageContent } from '../../src/types'
import { HomePage } from '../../src/pages/content/home-page'

export type PageEntry = {
	description: string
	render: () => PageContent
}

export const pages: Record<string, PageEntry> = {
	home: {
		description: 'Main entry point of the bot. Shows navigation to Play, Wallet, About, and Referral System.',
		render: () => HomePage.render(),
	},
}
