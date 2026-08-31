import { ChainAddressDtoOutput } from '@rips/api-client'
import { declareActions, noPayloadId, withPayloadId } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { AmountPayload } from './utils/codecs'

/**
 * Every action the bot can run, with the payload its buttons carry. Imports
 * nothing from pages or handlers, so a page can build a button without pulling
 * the whole handler graph in behind it.
 */
export const actionIds = declareActions({
	// Home
	openHome: withPayloadId<string | undefined>(),

	// Onboarding
	chooseCreateAccount: noPayloadId(),
	startImportKey: noPayloadId(),
	submitImportKey: withPayloadId<string>(),

	// About
	openAbout: noPayloadId(),

	// Play
	openChoosePreset: noPayloadId(),
	openChooseEntryAmount: withPayloadId<number>(),
	openEnterChooseEntryCountFromCheckout: noPayloadId(),
	openEnterPaymentOptions: noPayloadId(),
	openEnterPaymentOptionsFromEntryCount: withPayloadId<number>(),
	promptEntryCount: noPayloadId(),
	openEnterCheckout: noPayloadId(),
	openEnterCheckoutFromPaymentToken: withPayloadId<ChainAddressDtoOutput>(),
	openEnterCheckoutFromEntryCount: withPayloadId<number>(),
	refreshEnterCheckout: noPayloadId(),
	executeEnter: noPayloadId(),

	// Open RIPs / rips
	openOpenPulls: noPayloadId(),
	openOpenPullsNoBack: noPayloadId(),
	openRevealPayouts: noPayloadId(),
	openRevealSingle: noPayloadId(),
	openRevealAll: noPayloadId(),
	openMyRips: noPayloadId(),
	openRipStatus: withPayloadId<number>(),
	openViewPulls: withPayloadId<number>(),
	openOngoingRips: noPayloadId(),
	openFinalizedRips: withPayloadId<boolean>(),

	// Card collection
	openCardCollection: noPayloadId(),
	openCardCollectionTier: withPayloadId<number>(),

	// Wallet
	openWallet: noPayloadId(),
	openDeposit: noPayloadId(),
	openDepositChooseCurrency: withPayloadId<Chain>(),
	openDepositAddress: withPayloadId<ChainAddressDtoOutput>(),
	openDepositAddressQr: withPayloadId<ChainAddressDtoOutput>(),
	refreshDepositBalance: withPayloadId<ChainAddressDtoOutput>(),
	refreshDepositBalanceQr: withPayloadId<ChainAddressDtoOutput>(),
	openExportKeyWarning: noPayloadId(),
	openExportKey: noPayloadId(),

	// Withdraw
	openWithdrawChooseChain: noPayloadId(),
	openWithdrawChooseCurrency: withPayloadId<Chain>(),
	openWithdrawFromCurrency: withPayloadId<ChainAddressDtoOutput>(),
	openWithdrawFromAmount: withPayloadId<AmountPayload>(),
	openWithdrawFromRecipient: withPayloadId<string>(),
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
	openEnterChoosePaymentToken: withPayloadId<Chain>(),

	// Swap
	openSwapChooseSrcChain: noPayloadId(),
	openSwapChooseSrcToken: withPayloadId<Chain>(),
	openSwapChooseDstChain: withPayloadId<ChainAddressDtoOutput>(),
	openSwapChooseDstToken: withPayloadId<Chain>(),
	openSwapChooseAmount: withPayloadId<ChainAddressDtoOutput>(),
	promptSwapAmount: noPayloadId(),
	openSwapCheckout: noPayloadId(),
	openSwapCheckoutFromSrc: withPayloadId<ChainAddressDtoOutput>(),
	openSwapCheckoutFromDst: withPayloadId<ChainAddressDtoOutput>(),
	openSwapCheckoutFromAmount: withPayloadId<AmountPayload>(),
	executeSwap: noPayloadId(),
})
