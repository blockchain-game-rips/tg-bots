/**
 * Every fixed button label in the bot, so wording and decoration cannot drift
 * between the pages that share a button.
 *
 * Rules:
 * - Every word is capitalized, without exception.
 * - An emoji marks a destination — a button that opens another page. A label
 *   owns its emoji permanently: the same button looks the same everywhere.
 * - Operations (confirm, change, refresh, reveal) stay bare, with one
 *   exception: the button that broadcasts a transaction carries 🚀. At most
 *   one such button per page, always the first row.
 * - ✅ is reserved for page content describing what already happened, so it
 *   never appears on a button.
 * - Rows of the same kind of destination stay bare: an emoji repeated down a
 *   homogeneous list distinguishes nothing.
 */

const SEND_TRANSACTION_EMOJI = '🚀'

export const PLAY_RIPS = '🎮 Play Rips'
export const ENTER_RIPS = '🎮 Enter Rips'
export const ENTER_RIP = '🎮 Enter Rip'
export const ENTER_AGAIN = '🎮 Enter Again'
export const OPEN_PULLS = '🎁 Open Pulls'
export const MY_RIPS = '📊 My Rips'
export const ONGOING_RIPS = '⏳ Ongoing Rips'
export const FINALIZED_RIPS = '🏁 Finalized Rips'
export const COLLECTION = '🃏 Collection'
export const VIEW_COLLECTION = '🃏 View Collection'
export const VIEW_PULLS = '🎁 View Pulls'
export const VIEW_RIP_STATUS = '📊 View Rip Status'
export const WALLET = '💼 Wallet'
export const REFERRALS = '👥 Referrals'
export const REFERRAL_TIERS = '🏆 Referral Tiers'
export const CLAIM_REWARDS = '💰 Claim Rewards'
export const COPY_REFERRAL_LINK = 'Copy Referral Link'
export const SHARE_REFERRAL_LINK = 'Share Referral Link'
export const ABOUT = 'ℹ️ About'
export const BACK = '⬅️ Back'
export const HOME = '🏠 Home'

export const DEPOSIT = '📥 Deposit'
export const WITHDRAW = '📤 Withdraw'
export const BRIDGE_SWAP = '🌉 Bridge / Swap'
export const EXPORT_PRIVATE_KEY = '🔑 Export Private Key'
export const PAY_FROM_ANOTHER_CHAIN = '🌉 Pay From Another Chain'

export const CONFIRM_ENTRY = `${SEND_TRANSACTION_EMOJI} Confirm Entry`
export const CONFIRM_BRIDGE_AND_ENTER = `${SEND_TRANSACTION_EMOJI} Confirm Bridge & Enter`
export const CONFIRM_SWAP = `${SEND_TRANSACTION_EMOJI} Confirm Swap`
export const CONFIRM_BRIDGE = `${SEND_TRANSACTION_EMOJI} Confirm Bridge`
export const CONFIRM_WITHDRAWAL = `${SEND_TRANSACTION_EMOJI} Confirm Withdrawal`
export const CLAIM = `${SEND_TRANSACTION_EMOJI} Claim`

export const AGREE_AND_CONTINUE = 'Agree & Continue'
export const TERMS_OF_SERVICE = '📄 Terms of Service'

export const REVEAL_NEXT = 'Reveal Next'
export const REVEAL_ALL = 'Reveal All'
export const CREATE_NEW_ACCOUNT = 'Create New Account'
export const IMPORT_PRIVATE_KEY = 'Import Private Key'
export const SHOW_PRIVATE_KEY = 'I Understand, Show Private Key'
export const COPY_ADDRESS = 'Copy Address'
export const SHOW_QR = 'Show QR'
export const HIDE_QR = 'Hide QR'
export const REFRESH_BALANCE = 'Refresh Balance'
export const REFRESH_BALANCES = 'Refresh Balances'
export const UPDATE_BALANCE_AND_QUOTE = 'Update Balance & Quote'
export const CHANGE_ENTRY_COUNT = 'Change Entry Count'
export const CHANGE_PAYMENT_TOKEN = 'Change Payment Token'
export const CHANGE_AMOUNT = 'Change Amount'
export const CHANGE_DESTINATION = 'Change Destination'
export const CHANGE_SOURCE = 'Change Source'
export const CUSTOM_AMOUNT = 'Custom Amount'
export const MAX = 'Max'
export const WITHDRAW_MAX = 'Withdraw Max'
export const ENTER_AMOUNT = 'Enter Amount'
export const ENTER_RECIPIENT = 'Enter Recipient'
export const SHOW_ALL = 'Show All'
export const SHOW_MINE = 'Show Mine'

export function depositCurrencyLabel(currencyLabel: string): string {
	return `${DEPOSIT} ${currencyLabel}`
}

/**
 * Bare because these render as a list where every row is a deposit button.
 */
export function depositListRowLabel(chainName: string, symbol: string): string {
	return `Deposit ${chainName} ${symbol}`
}

export function ripDetailsLabel(ripId: string): string {
	return `Rip #${ripId} Details`
}
