import { AboutPage } from '../../src/pages/content/about/about-page'
import { HomePage } from '../../src/pages/content/home-page'
import { BuyChooseStakePage } from '../../src/pages/content/play/buy-choose-stake-page'
import { BuyChooseTicketCountPage } from '../../src/pages/content/play/buy-choose-ticket-count-page'
import { BuyConfirmPage } from '../../src/pages/content/play/buy-confirm-page'
import { BuyInsufficientFundsPage } from '../../src/pages/content/play/buy-insufficient-funds-page'
import { BuySuccessPage } from '../../src/pages/content/play/buy-success-page'
import { FinishedRoundsPage } from '../../src/pages/content/play/finished-rounds-page'
import { OngoingRoundsPage } from '../../src/pages/content/play/ongoing-rounds-page'
import { PlayPage } from '../../src/pages/content/play/play-page'
import { RevealAllPage } from '../../src/pages/content/play/reveal-all-page'
import { RevealPrizesPage } from '../../src/pages/content/play/reveal-prizes-page'
import { RevealSinglePage } from '../../src/pages/content/play/reveal-single-page'
import { StatusPage } from '../../src/pages/content/play/status-page'
import { PageContent } from '../../src/types'
import {
	mockAvailableStakes,
	mockBalance,
	mockConfigs,
	mockFinishedRounds,
	mockPurchase,
	mockRevealedPrizes,
	mockRound,
	mockRound2,
	mockUnrevealedPrizes,
	mockUserEvmAddress,
} from './static-data'

export type PageEntry = {
	description: string
	render: () => PageContent
}

export const pages: Record<string, PageEntry> = {
	home: {
		description:
			'Main entry point of the bot. Shows navigation to Play, Wallet, About, and Referral System.',
		render: () => HomePage.render(),
	},
	play: {
		description:
			'The Play hub. Shows the main game actions: buy tickets, open (reveal) rips, check round status, and access the card collection.',
		render: () => PlayPage.render(),
	},
	'buy-choose-stake': {
		description:
			'First step of buying tickets. Shows available stake tiers to pick from. Opened from Play.',
		render: () => BuyChooseStakePage.render(mockAvailableStakes),
	},
	'buy-choose-ticket-count': {
		description:
			'Second step of buying tickets. Choose how many tickets to buy: preset options or custom amount. Opened from choose-stake.',
		render: () => BuyChooseTicketCountPage.render(mockAvailableStakes[0]),
	},
	'buy-confirm': {
		description:
			'Third step of buying tickets. Summary of the purchase with a Confirm button. Opened from choose-ticket-count.',
		render: () => BuyConfirmPage.render(mockAvailableStakes[0], 3),
	},
	'buy-success': {
		description:
			'Final step of the buy flow. Confirms a successful ticket purchase — shows round number, ticket count, total cost, and blockchain fee. Opened after buy-confirm.',
		render: () => BuySuccessPage.render(mockPurchase, mockRound),
	},
	'buy-insufficient-funds': {
		description:
			"Shown instead of confirm-purchase when the user's balance is too low. Offers option to enter from another token (zap flow) or go back.",
		render: () =>
			BuyInsufficientFundsPage.render(
				mockBalance,
				mockAvailableStakes[0],
				3,
			),
	},
	status: {
		description:
			"Overview of the user's activity — shows their tickets in ongoing rounds, with navigation to Ongoing Rounds and Completed Rounds lists.",
		render: () => StatusPage.render([mockRound], mockUserEvmAddress),
	},
	'ongoing-rounds': {
		description:
			'List of all active rounds grouped by stake tier, showing tickets remaining and time left per round. Back leads to Status.',
		render: () =>
			OngoingRoundsPage.render(
				[mockRound, mockRound2],
				mockAvailableStakes,
			),
	},
	'finished-rounds': {
		description:
			'Global list of all completed rounds, showing stake tier, round number, and status. Back leads to Status.',
		render: () => FinishedRoundsPage.render(mockFinishedRounds),
	},
	'reveal-prizes': {
		description:
			'Entry point for revealing tickets ("Open Rips" in the Play menu). Shows unrevealed ticket count with "Reveal next" and "Reveal all" buttons. Part of a 3-page reveal flow that behaves as one screen to the user — back leads to Play.',
		render: () =>
			RevealPrizesPage.render([mockRound], mockUnrevealedPrizes),
	},
	'reveal-single': {
		description:
			'Shows the result of revealing one ticket. Also shows remaining unrevealed count with options to continue. Only opened from reveal-prizes. Part of the reveal flow — back leads to Play.',
		render: () =>
			RevealSinglePage.render(
				mockRound,
				mockRevealedPrizes[0],
				mockUnrevealedPrizes,
			),
	},
	'reveal-all': {
		description:
			'Shows all revealed prizes as a list. Also shows remaining unrevealed count. Can be opened from reveal-prizes or reveal-single. Part of the reveal flow — back leads to Play.',
		render: () =>
			RevealAllPage.render(
				[mockRound],
				mockRevealedPrizes,
				mockUnrevealedPrizes,
			),
	},
	about: {
		description:
			'Explains how the game works and lists all available stake tiers. Each tier shows the ticket price (with USD equivalent), round duration, and ticket cap.',
		render: () => AboutPage.render(mockConfigs),
	},
}
