import { AboutPage } from '../../src/pages/content/about/about-page'
import { HomePage } from '../../src/pages/content/home-page'
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
	mockConfigs,
	mockFinishedRounds,
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
