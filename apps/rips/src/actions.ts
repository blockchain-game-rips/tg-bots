import { buyTickets } from './action-handlers/buy-tickets'
import { executeWithdraw } from './action-handlers/execute-withdraw'
import { notImplemented } from './action-handlers/not-implemented'
import { requestCustomTicketAmount } from './action-handlers/request-custom-ticket-amount'
import { requestWithdrawCustomAmount } from './action-handlers/request-withdraw-custom-amount'
import { requestWithdrawRecipient } from './action-handlers/request-withdraw-recipient'
import { showAbout } from './action-handlers/show-about'
import { showCardChooseStake } from './action-handlers/show-card-choose-stake'
import { showCardCollection } from './action-handlers/show-card-collection'
import { showChooseStake } from './action-handlers/show-choose-stake'
import { showChooseTicketAmount } from './action-handlers/show-choose-ticket-amount'
import { showChooseWithdrawAmount } from './action-handlers/show-choose-withdraw-amount'
import { showCompletedRounds } from './action-handlers/show-completed-rounds'
import { showConfirmPurchase } from './action-handlers/show-confirm-purchase'
import { showHome } from './action-handlers/show-home'
import { showOngoingRounds } from './action-handlers/show-ongoing-rounds'
import { showOpenRips } from './action-handlers/show-open-rips'
import { showPlay } from './action-handlers/show-play'
import { showReferral } from './action-handlers/show-referral'
import { showReferralAbout } from './action-handlers/show-referral-about'
import { showReferralWithdrawReward } from './action-handlers/show-referral-withdraw-reward'
import { showRevealPrizes } from './action-handlers/show-reveal-prizes'
import { showStatus } from './action-handlers/show-status'
import { showWallet } from './action-handlers/show-wallet'
import { showWithdraw } from './action-handlers/show-withdraw'
import { submitWithdrawAmount } from './action-handlers/submit-withdraw-amount'
import { submitWithdrawRecipient } from './action-handlers/submit-withdraw-recipient'
import { ActionHandler } from './types'

const actionDefs = {
	// Home
	showHome: { id: 'sh', handler: showHome },

	// About
	showAbout: { id: 'sa', handler: showAbout },

	// Play
	showPlay: { id: 'sp', handler: showPlay },
	showChooseStake: { id: 'scs', handler: showChooseStake },
	showChooseTicketAmount: { id: 'scta', handler: showChooseTicketAmount },
	requestCustomTicketAmount: {
		id: 'rcta',
		handler: requestCustomTicketAmount,
	},
	showConfirmPurchase: { id: 'scp', handler: showConfirmPurchase },
	buyTickets: { id: 'bts', handler: buyTickets },

	// Open RIPs / rounds
	showOpenRips: { id: 'sor', handler: showOpenRips },
	showRevealPrizes: { id: 'srp', handler: showRevealPrizes },
	showStatus: { id: 'sst', handler: showStatus },
	showOngoingRounds: { id: 'sogr', handler: showOngoingRounds },
	showCompletedRounds: { id: 'scr', handler: showCompletedRounds },

	// Card collection
	showCardChooseStake: { id: 'sccs', handler: showCardChooseStake },
	showCardCollection: { id: 'scc', handler: showCardCollection },

	// Wallet
	showWallet: { id: 'sw', handler: showWallet },

	// Withdraw (legacy single-chain)
	showWithdraw: { id: 'swp', handler: showWithdraw },
	showChooseWithdrawAmount: { id: 'scwa', handler: showChooseWithdrawAmount },
	requestWithdrawRecipient: { id: 'rwr', handler: requestWithdrawRecipient },
	submitWithdrawRecipient: { id: 'sbrec', handler: submitWithdrawRecipient },
	requestWithdrawCustomAmount: {
		id: 'rwca',
		handler: requestWithdrawCustomAmount,
	},
	submitWithdrawAmount: { id: 'sbamt', handler: submitWithdrawAmount },
	executeWithdraw: { id: 'ew', handler: executeWithdraw },

	// Referral
	showReferral: { id: 'sref', handler: showReferral },
	showReferralAbout: { id: 'srfab', handler: showReferralAbout },
	showReferralWithdrawReward: {
		id: 'srwr',
		handler: showReferralWithdrawReward,
	},

	// Zap (in progress)
	showZapChooseChain: { id: 'szc', handler: notImplemented },
	showZapChooseToken: { id: 'szt', handler: notImplemented },
	showZapConfirm: { id: 'szcp', handler: notImplemented },
	executeZap: { id: 'ez', handler: notImplemented },

	// Withdraw new multi-chain (in progress)
	showWithdrawChooseChain: { id: 'swdc', handler: notImplemented },
	showWithdrawChooseToken: { id: 'swdt', handler: notImplemented },
	showWithdrawChooseAmount: { id: 'swda', handler: notImplemented },
	showWithdrawChooseReceiver: { id: 'swdr', handler: notImplemented },
	showWithdrawConfirm: { id: 'swdcp', handler: notImplemented },
	executeWithdrawNewChain: { id: 'ewdc', handler: notImplemented },

	// Swap (in progress)
	showSwapChooseChain: { id: 'sssc', handler: notImplemented },
	showSwapChooseToken: { id: 'ssst', handler: notImplemented },
	showSwapChooseAmount: { id: 'sssa', handler: notImplemented },
	showSwapConfirm: { id: 'sscp', handler: notImplemented },
	executeSwap: { id: 'es', handler: notImplemented },
} as const

type ActionDefs = typeof actionDefs
type ActionName = keyof ActionDefs

export type ActionId = ActionDefs[ActionName]['id']

//TODO: refator builder to make them readable
function buildActionIds<
	T extends Record<string, { id: string; handler: ActionHandler }>,
>(defs: T): { [K in keyof T]: T[K]['id'] } {
	const result = {} as { [K in keyof T]: T[K]['id'] }
	for (const key of Object.keys(defs) as (keyof T)[]) {
		result[key] = defs[key].id
	}
	return result
}

function buildActions<
	T extends Record<string, { id: string; handler: ActionHandler }>,
>(defs: T): Record<T[keyof T]['id'], ActionHandler> {
	const result = {} as Record<T[keyof T]['id'], ActionHandler>
	for (const { id, handler } of Object.values(defs) as {
		id: T[keyof T]['id']
		handler: ActionHandler
	}[]) {
		result[id] = handler
	}
	return result
}

export const actionIds = buildActionIds(actionDefs)

export const actions = buildActions(actionDefs)
