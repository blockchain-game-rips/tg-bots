import { CustomTicketAmountPrompt } from '../prompts/custom-ticket-amount-prompt'
import { AboutPage } from './about/about-page'
import { ChooseStakePage } from './choose-stake/choose-stake-page'
import {
	ChooseTicketAmountPage,
	chooseTicketAmountPageId,
} from './choose-ticket-amount/choose-ticket-amount-page'
import { ConfirmPurchasePage } from './confirm-purchase/confirm-purchase-page'
import { HomePage } from './home/home-page'
import { Page, Prompt } from './interfaces'
import { PlayPage } from './play/play-page'

export const homePageId = 'home'
const aboutPageId = 'about'
const playPageId = 'play'
const chooseStakePageId = 'chooseStake'
const confirmPurchasePageId = 'confirm'

export function buildPageRegistry() {
	const pageRegistry: { [id: string]: Page } = {}

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

	pageRegistry[homePageId] = homePage
	pageRegistry[aboutPageId] = aboutPage
	pageRegistry[playPageId] = playPage
	pageRegistry[chooseStakePageId] = chooseStakePage
	pageRegistry[chooseTicketAmountPageId] = chooseTicketAmountPage
	pageRegistry[confirmPurchasePageId] = confirmPurchasePage

	return pageRegistry
}

const customTicketAmountPromptId = 'custom'

export function buildPromptRegistry() {
	const promptRegistry: { [id: string]: Prompt } = {}

	const customTicketAmountPrompt = new CustomTicketAmountPrompt()
	promptRegistry[customTicketAmountPromptId] = customTicketAmountPrompt

	return promptRegistry
}
