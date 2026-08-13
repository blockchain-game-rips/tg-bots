import { AvailablePresetDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { joinLines } from '@rips/grammy-kit'
import { Chain, configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import {
	buildChainKeyboard,
	buildCurrencyKeyboard,
} from '../../utils/chain-currency-keyboard'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

const ANOTHER_CHAIN_TITLE = '🌉 Pay from another chain'

export const EnterChoosePaymentChainPage = {
	render(args: {
		availablePreset: AvailablePresetDtoOutput
		chains: Chain[]
	}): PageContent {
		const { availablePreset, chains } = args
		const config = resolveConfig(availablePreset)

		const message = joinLines([
			enterBreadcrumb(configName(config)),
			'',
			ANOTHER_CHAIN_TITLE,
			'',
			'Pay for your entries with funds on another chain.',
			'The bot moves them over and enters the Rip automatically.',
			'',
			'Payouts are credited on Base.',
			'',
			"First, choose a chain — you'll pick a token next.",
		])

		const keyboard = buildChainKeyboard(
			chains,
			actionIds.openEnterChoosePaymentToken,
		).appendNavButtons()

		return { message, keyboard }
	},
}

export const EnterChoosePaymentTokenPage = {
	render(args: {
		availablePreset: AvailablePresetDtoOutput
		chain: Chain
		currencies: CurrencyDtoOutput[]
	}): PageContent {
		const { availablePreset, chain, currencies } = args
		const config = resolveConfig(availablePreset)

		const chainName = chainToName(chain)

		const message = joinLines([
			enterBreadcrumb(configName(config), chainName),
			'',
			ANOTHER_CHAIN_TITLE,
			'',
			`From: ${chainName}`,
			'',
			'Choose a token to pay with:',
		])

		const keyboard = buildCurrencyKeyboard(
			currencies,
			actionIds.openEnterCheckoutFromPaymentToken,
		).appendNavButtons()

		return { message, keyboard }
	},
}
