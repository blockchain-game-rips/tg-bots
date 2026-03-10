import { AboutPage } from './about/about-page'
import { ChooseStakePage } from './choose-stake/choose-stake-page'
import {
	ChooseTicketAmountPage,
	chooseTicketAmountPageId,
} from './choose-ticket-amount/choose-ticket-amount-page'
import { CustomAmountPage } from './custom-amount/custom-amount'
import { HomePage } from './home/home-page'
import { Renderable } from './interfaces'
import { PlayPage } from './play/play-page'

export const homePageId = 'home'
const aboutPageId = 'about'
const playPageId = 'play'
const chooseStakePageId = 'chooseStake'
const customAmountPageId = 'custom'

export function buildRegistry() {
	const pageRegisty: { [id: string]: Renderable } = {}

	const homePage = new HomePage([
		{ label: 'About', pageId: aboutPageId },
		{ label: 'Play', pageId: playPageId },
	])
	const aboutPage = new AboutPage({ home: homePageId, parent: homePageId })
	const playPage = new PlayPage(
		[{ label: 'Buy tickets', pageId: chooseStakePageId }],
		{ home: homePageId, parent: homePageId },
	)
	const chooseStakePage = new ChooseStakePage({
		home: homePageId,
		parent: playPageId,
	})
	const chooseTicketAmountPage = new ChooseTicketAmountPage({
		home: homePageId,
		parent: chooseStakePageId,
	})
	const customAmountPage = new CustomAmountPage()

	pageRegisty[homePageId] = homePage
	pageRegisty[aboutPageId] = aboutPage
	pageRegisty[playPageId] = playPage
	pageRegisty[chooseStakePageId] = chooseStakePage
	pageRegisty[chooseTicketAmountPageId] = chooseTicketAmountPage
	pageRegisty[customAmountPageId] = customAmountPage

	return pageRegisty
}
