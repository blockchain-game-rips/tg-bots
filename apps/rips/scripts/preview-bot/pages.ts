import { AboutPage } from '../../src/pages/content/about/about-page'
import { HomePage } from '../../src/pages/content/home-page'
import { PageContent } from '../../src/types'
import { mockConfigs } from './static-data'

export type PageEntry = {
	description: string
	render: () => PageContent
}

export const pages: Record<string, PageEntry> = {
	home: {
		description: 'Main entry point of the bot. Shows navigation to Play, Wallet, About, and Referral System.',
		render: () => HomePage.render(),
	},
	about: {
		description: 'Explains how the game works and lists all available stake tiers. Each tier shows the ticket price (with USD equivalent), round duration, and ticket cap.',
		render: () => AboutPage.render(mockConfigs),
	},
}
