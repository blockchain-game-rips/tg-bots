import { CustomTicketAmountPrompt } from '../prompts/custom-ticket-amount-prompt'
import { AboutPage } from './about/about-page'
import { ChooseStakePage } from './choose-stake/choose-stake-page'
import { ChooseTicketAmountPage } from './choose-ticket-amount/choose-ticket-amount-page'
import { ConfirmPurchasePage } from './confirm-purchase/confirm-purchase-page'
import { HomePage } from './home/home-page'
import { Page, Prompt } from './interfaces'
import { pageIds } from './page-ids'
import { PlayPage } from './play/play-page'
import { promptIds } from './prompt-ids'

export function buildPageRegistry() {
	const pageRegistry: { [id: string]: Page } = {}

	const homePage = new HomePage([
		{ label: 'About', pageId: pageIds.about },
		{ label: 'Play', pageId: pageIds.play },
	])
	const aboutPage = new AboutPage({
		home: pageIds.home,
		parent: pageIds.home,
	})
	const playPage = new PlayPage(
		[{ label: 'Buy tickets', pageId: pageIds.chooseStake }],
		{ home: pageIds.home, parent: pageIds.home },
	)
	const chooseStakePage = new ChooseStakePage({
		home: pageIds.home,
		parent: pageIds.play,
	})
	const chooseTicketAmountPage = new ChooseTicketAmountPage({
		home: pageIds.home,
		parent: pageIds.chooseStake,
	})
	const confirmPurchasePage = new ConfirmPurchasePage()

	pageRegistry[pageIds.home] = homePage
	pageRegistry[pageIds.about] = aboutPage
	pageRegistry[pageIds.play] = playPage
	pageRegistry[pageIds.chooseStake] = chooseStakePage
	pageRegistry[pageIds.chooseTicketAmount] = chooseTicketAmountPage
	pageRegistry[pageIds.confirmPurchase] = confirmPurchasePage

	return pageRegistry
}

export function buildPromptRegistry() {
	const promptRegistry: { [id: string]: Prompt } = {}

	const customTicketAmountPrompt = new CustomTicketAmountPrompt()
	promptRegistry[promptIds.customTicketAmount] = customTicketAmountPrompt

	return promptRegistry
}
