import { AboutPage } from './about/about-page'
import { BuyTicketsPage } from './buy-tickets/buy-tickets-page'
import { HomePage } from './home/home-page'
import { PlayPage } from './play/play-page'
import { Renderable } from './interfaces'

export const homePageId = 'home'
const aboutPageId = 'about'
const playPageId = 'play'
const buyTicketsPageId = 'buyTickets'

export function buildRegistry() {
	const pageRegisty: { [id: string]: Renderable } = {}

	const homePage = new HomePage([
		{ label: 'About', pageId: aboutPageId },
		{ label: 'Play', pageId: playPageId },
	])
	const aboutPage = new AboutPage({ home: homePageId, parent: homePageId })
	const playPage = new PlayPage(
		[{ label: 'Buy tickets', pageId: buyTicketsPageId }],
		{ home: homePageId, parent: homePageId },
	)
	const buyTicketsPage = new BuyTicketsPage({
		home: homePageId,
		parent: playPageId,
	})

	pageRegisty[homePageId] = homePage
	pageRegisty[aboutPageId] = aboutPage
	pageRegisty[playPageId] = playPage
	pageRegisty[buyTicketsPageId] = buyTicketsPage

	return pageRegisty
}
