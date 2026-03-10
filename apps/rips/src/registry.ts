import { AboutPage } from './pages/about/about-page'
import { ChooseStakePage } from './pages/choose-stake/choose-stake-page'
import { ChooseTicketAmountPage } from './pages/choose-ticket-amount/choose-ticket-amount-page'
import { ConfirmPurchasePage } from './pages/confirm-purchase/confirm-purchase-page'
import { HomePage } from './pages/home/home-page'
import { Page, Prompt } from './pages/interfaces'
import { pageIds } from './pages/page-ids'
import { PlayPage } from './pages/play/play-page'
import { CustomTicketAmountPrompt } from './prompts/custom-ticket-amount-prompt'
import { promptIds } from './prompts/prompt-ids'

export function buildPageRegistry() {
	const pageRegistry: { [id: string]: Page } = {}

	pageRegistry[pageIds.home] = new HomePage()
	pageRegistry[pageIds.about] = new AboutPage()
	pageRegistry[pageIds.play] = new PlayPage()
	pageRegistry[pageIds.chooseStake] = new ChooseStakePage()
	pageRegistry[pageIds.chooseTicketAmount] = new ChooseTicketAmountPage()
	pageRegistry[pageIds.confirmPurchase] = new ConfirmPurchasePage()

	return pageRegistry
}

export function buildPromptRegistry() {
	const promptRegistry: { [id: string]: Prompt } = {}

	promptRegistry[promptIds.customTicketAmount] =
		new CustomTicketAmountPrompt()

	return promptRegistry
}
