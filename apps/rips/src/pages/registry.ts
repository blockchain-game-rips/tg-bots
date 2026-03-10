import { CustomTicketAmountReplyable } from '../replyable/custom-ticket-amount-replyable'
import { AboutPage } from './about/about-page'
import { ChooseStakePage } from './choose-stake/choose-stake-page'
import {
	ChooseTicketAmountPage,
	chooseTicketAmountPageId,
} from './choose-ticket-amount/choose-ticket-amount-page'
import { ConfirmPurchasePage } from './confirm-purchase/confirm-purchase-page'
import { HomePage } from './home/home-page'
import { Renderable, Replyable } from './interfaces'
import { PlayPage } from './play/play-page'

export const homePageId = 'home'
const aboutPageId = 'about'
const playPageId = 'play'
const chooseStakePageId = 'chooseStake'
const confirmPurchasePageId = 'confirm'

export function buildPageRegistry() {
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
	const confirmPurchasePage = new ConfirmPurchasePage()

	pageRegisty[homePageId] = homePage
	pageRegisty[aboutPageId] = aboutPage
	pageRegisty[playPageId] = playPage
	pageRegisty[chooseStakePageId] = chooseStakePage
	pageRegisty[chooseTicketAmountPageId] = chooseTicketAmountPage
	pageRegisty[confirmPurchasePageId] = confirmPurchasePage

	return pageRegisty
}

const customTicketAmountReplyableId = 'custom'

export function buildReplyableRegistry() {
	const replyableRegistry: { [id: string]: Replyable } = {}

	const customTicketAmountReplyable = new CustomTicketAmountReplyable()
	replyableRegistry[customTicketAmountReplyableId] =
		customTicketAmountReplyable

	return replyableRegistry
}
