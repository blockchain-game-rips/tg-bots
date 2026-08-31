import { ChainAddressDtoOutput } from '@rips/api-client'
import { declareActions, noPayloadId, payload } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { AmountPayload } from './utils/codecs'

/**
 * Every action the bot can run, with the payload its buttons carry. Imports
 * nothing from pages or handlers, so a page can build a button without pulling
 * the whole handler graph in behind it.
 */
export const actionIds = declareActions({
	// Home
	openHome: payload<string | undefined>(),

	// Onboarding
	chooseCreateAccount: noPayloadId(),
	startImportKey: noPayloadId(),
	submitImportKey: payload<string>(),

	// About
	openAbout: noPayloadId(),

	// Play
	openChoosePreset: noPayloadId(),
	openChooseEntryAmount: payload<number>(),
	openEnterChooseEntryCountFromCheckout: noPayloadId(),
	openEnterPaymentOptions: noPayloadId(),
	openEnterPaymentOptionsFromEntryCount: payload<number>(),
	promptEntryCount: noPayloadId(),
	openEnterCheckout: noPayloadId(),
	openEnterCheckoutFromPaymentToken: payload<ChainAddressDtoOutput>(),
	openEnterCheckoutFromEntryCount: payload<number>(),
	refreshEnterCheckout: noPayloadId(),
	executeEnter: noPayloadId(),

	// Open RIPs / rips
	openOpenPulls: noPayloadId(),
	openOpenPullsNoBack: noPayloadId(),
	openRevealPayouts: noPayloadId(),
	openRevealSingle: noPayloadId(),
	openRevealAll: noPayloadId(),
	openMyRips: noPayloadId(),
	openRipStatus: payload<number>(),
	openViewPulls: payload<number>(),
	openOngoingRips: noPayloadId(),
	openFinalizedRips: payload<boolean>(),

	// Card collection
	openCardCollection: noPayloadId(),
	openCardCollectionTier: payload<number>(),

	// Wallet
	openWallet: noPayloadId(),
	openDeposit: noPayloadId(),
	openDepositChooseCurrency: payload<Chain>(),
	openDepositAddress: payload<ChainAddressDtoOutput>(),
	openDepositAddressQr: payload<ChainAddressDtoOutput>(),
	refreshDepositBalance: payload<ChainAddressDtoOutput>(),
	refreshDepositBalanceQr: payload<ChainAddressDtoOutput>(),
	openExportKeyWarning: noPayloadId(),
	openExportKey: noPayloadId(),

	// Withdraw
	openWithdrawChooseChain: noPayloadId(),
	openWithdrawChooseCurrency: payload<Chain>(),
	openWithdrawFromCurrency: payload<ChainAddressDtoOutput>(),
	openWithdrawFromAmount: payload<AmountPayload>(),
	openWithdrawFromRecipient: payload<string>(),
	openWithdrawChooseAmount: noPayloadId(),
	executeWithdraw: noPayloadId(),
	promptWithdrawRecipient: noPayloadId(),
	promptWithdrawAmount: noPayloadId(),

	// Referral
	openReferral: noPayloadId(),
	openReferralTiers: noPayloadId(),
	openReferralWithdrawReward: noPayloadId(),
	executeReferralWithdrawReward: noPayloadId(),

	// Payment chain / token pickers
	openEnterChoosePaymentChain: noPayloadId(),
	openEnterChoosePaymentToken: payload<Chain>(),

	// Swap
	openSwapChooseSrcChain: noPayloadId(),
	openSwapChooseSrcToken: payload<Chain>(),
	openSwapChooseDstChain: payload<ChainAddressDtoOutput>(),
	openSwapChooseDstToken: payload<Chain>(),
	openSwapChooseAmount: payload<ChainAddressDtoOutput>(),
	promptSwapAmount: noPayloadId(),
	openSwapCheckout: noPayloadId(),
	openSwapCheckoutFromSrc: payload<ChainAddressDtoOutput>(),
	openSwapCheckoutFromDst: payload<ChainAddressDtoOutput>(),
	openSwapCheckoutFromAmount: payload<AmountPayload>(),
	executeSwap: noPayloadId(),
})
