import { notImplemented } from './action-handlers/not-implemented'
import { buyTickets } from './action-handlers/play/buy-tickets'
import { handleTicketCountChosen } from './action-handlers/play/handle-ticket-count-chosen'
import { requestCustomTicketAmount } from './action-handlers/play/request-custom-ticket-amount'
import { showBuyChooseStake } from './action-handlers/play/show-buy-choose-stake'
import { showCardChooseStake } from './action-handlers/play/show-card-choose-stake'
import { showCardCollection } from './action-handlers/play/show-card-collection'
import { showChooseTicketCount } from './action-handlers/play/show-choose-ticket-count'
import { showCompletedRounds } from './action-handlers/play/show-completed-rounds'
import { showOngoingRounds } from './action-handlers/play/show-ongoing-rounds'
import { showOpenRips } from './action-handlers/play/show-open-rips'
import { showPlay } from './action-handlers/play/show-play'
import { showRevealPrizes } from './action-handlers/play/show-reveal-prizes'
import { showStatus } from './action-handlers/play/show-status'
import { showReferral } from './action-handlers/referral-system/show-referral'
import { showReferralAbout } from './action-handlers/referral-system/show-referral-about'
import { showReferralWithdrawReward } from './action-handlers/referral-system/show-referral-withdraw-reward'
import { showAbout } from './action-handlers/show-about'
import { showHome } from './action-handlers/show-home'
import { executeWithdraw } from './action-handlers/wallet/execute-withdraw'
import { requestWithdrawCustomAmount } from './action-handlers/wallet/request-withdraw-custom-amount'
import { requestWithdrawRecipient } from './action-handlers/wallet/request-withdraw-recipient'
import { showChooseWithdrawAmount } from './action-handlers/wallet/show-choose-withdraw-amount'
import { showWallet } from './action-handlers/wallet/show-wallet'
import { showWithdraw } from './action-handlers/wallet/show-withdraw'
import { submitWithdrawAmount } from './action-handlers/wallet/submit-withdraw-amount'
import { submitWithdrawRecipient } from './action-handlers/wallet/submit-withdraw-recipient'
import { ActionHandler } from './types'

const actionDefs = {
	// Home
	showHome: { id: 'sh', handler: showHome },

	// About
	showAbout: { id: 'sa', handler: showAbout },

	// Play
	showPlay: { id: 'sp', handler: showPlay },
	showChooseStake: { id: 'scs', handler: showBuyChooseStake },
	showChooseTicketAmount: { id: 'scta', handler: showChooseTicketCount },
	requestCustomTicketAmount: {
		id: 'rcta',
		handler: requestCustomTicketAmount,
	},
	showConfirmPurchase: { id: 'scp', handler: handleTicketCountChosen },
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
} as const satisfies Record<string, { id: string; handler: ActionHandler }>

function validateUniqueIds<
	T extends Record<string, { id: string; handler: ActionHandler }>,
>(defs: T): T {
	const seen = new Set<string>()

	for (const [key, { id }] of Object.entries(defs)) {
		if (seen.has(id))
			throw new Error(`Duplicate action id "${id}" on "${key}"`)
		seen.add(id)
	}

	return defs
}

const validatedActionDefs = validateUniqueIds(actionDefs)

type ActionDefs = typeof validatedActionDefs
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

export const actionIds = buildActionIds(validatedActionDefs)

export const actions = buildActions(validatedActionDefs)
