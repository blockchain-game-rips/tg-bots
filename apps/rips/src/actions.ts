import { notImplemented } from './action-handlers/not-implemented'
import { buyTickets } from './action-handlers/play/buy-tickets'
import { requestCustomTicketCount } from './action-handlers/play/request-custom-ticket-count'
import { showBuyCheckout } from './action-handlers/play/show-buy-checkout'
import { showBuyChooseStake } from './action-handlers/play/show-buy-choose-stake'
import { showBuyChooseTicketCount } from './action-handlers/play/show-buy-choose-ticket-count'
import { showCardChooseStake } from './action-handlers/play/show-card-choose-stake'
import { showCardCollection } from './action-handlers/play/show-card-collection'
import { showCompletedRounds } from './action-handlers/play/show-completed-rounds'
import { showOngoingRounds } from './action-handlers/play/show-ongoing-rounds'
import { showOpenRips } from './action-handlers/play/show-open-rips'
import { showPlay } from './action-handlers/play/show-play'
import { showRevealAll } from './action-handlers/play/show-reveal-all'
import { showRevealPrizes } from './action-handlers/play/show-reveal-prizes'
import { showRevealSingle } from './action-handlers/play/show-reveal-single'
import { showStatus } from './action-handlers/play/show-status'
import { showReferral } from './action-handlers/referral-system/show-referral'
import { showReferralAbout } from './action-handlers/referral-system/show-referral-about'
import { showReferralWithdrawReward } from './action-handlers/referral-system/show-referral-withdraw-reward'
import { showAbout } from './action-handlers/show-about'
import { showHome } from './action-handlers/show-home'
import { askWithdrawCustomAmount } from './action-handlers/wallet/ask-withdraw-custom-amount'
import { askWithdrawRecipient } from './action-handlers/wallet/ask-withdraw-recipient'
import { respondWithdrawChosenAmount } from './action-handlers/wallet/respond-withdraw-chosen-amount'
import { respondWithdrawChosenRecipient } from './action-handlers/wallet/respond-withdraw-chosen-recipient'
import { sendWithdrawTx } from './action-handlers/wallet/send-withdraw-tx'
import { showWallet } from './action-handlers/wallet/show-wallet'
import { showWithdraw } from './action-handlers/wallet/show-withdraw'
import { showWithdrawChooseAmount } from './action-handlers/wallet/show-withdraw-choose-amount'
import { showWithdrawChooseChain } from './action-handlers/wallet/show-withdraw-choose-chain'
import { showWithdrawChooseCurrency } from './action-handlers/wallet/show-withdraw-choose-currency'
import { ActionHandler } from './types'

const actionDefs = {
	// Home
	showHome: { id: 'sh', handler: showHome },

	// About
	showAbout: { id: 'sa', handler: showAbout },

	// Play
	showPlay: { id: 'sp', handler: showPlay },
	showChooseStake: { id: 'scs', handler: showBuyChooseStake },
	showChooseTicketAmount: { id: 'scta', handler: showBuyChooseTicketCount },
	requestCustomTicketAmount: {
		id: 'rcta',
		handler: requestCustomTicketCount,
	},
	showBuyCheckout: { id: 'sbc', handler: showBuyCheckout },
	buyTickets: { id: 'bts', handler: buyTickets },

	// Open RIPs / rounds
	showOpenRips: { id: 'sor', handler: showOpenRips },
	showRevealPrizes: { id: 'srp', handler: showRevealPrizes },
	showRevealSingle: { id: 'srps', handler: showRevealSingle },
	showRevealAll: { id: 'srpa', handler: showRevealAll },
	showStatus: { id: 'sst', handler: showStatus },
	showOngoingRounds: { id: 'sogr', handler: showOngoingRounds },
	showCompletedRounds: { id: 'scr', handler: showCompletedRounds },

	// Card collection
	showCardChooseStake: { id: 'sccs', handler: showCardChooseStake },
	showCardCollection: { id: 'scc', handler: showCardCollection },

	// Wallet
	showWallet: { id: 'sw', handler: showWallet },

	// Withdraw
	showWithdrawChooseChain: { id: 'swcc', handler: showWithdrawChooseChain },
	showWithdrawChooseToken: {
		id: 'swct',
		handler: showWithdrawChooseCurrency,
	},
	showWithdraw: { id: 'swp', handler: showWithdraw },
	showWithdrawChooseAmount: { id: 'swca', handler: showWithdrawChooseAmount },
	sendWithdrawTx: { id: 'cw', handler: sendWithdrawTx },
	askWithdrawRecipient: { id: 'awr', handler: askWithdrawRecipient },
	respondWithdrawRecipient: {
		id: 'rwr',
		handler: respondWithdrawChosenRecipient,
	},
	respondWithdrawCustomAmount: {
		id: 'rwca',
		handler: respondWithdrawChosenAmount,
	},
	askWithdrawAmount: { id: 'sbamt', handler: askWithdrawCustomAmount },

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
