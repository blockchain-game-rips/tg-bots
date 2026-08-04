import { CurrencyDto } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { ActionId, Chain, PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChainKeyboard } from '../choose-chain-currency'

export const SwapChooseSrcChainPage = {
	renderFreshDraft(args: { chains: Chain[] }): PageContent {
		return {
			message: buildMessage(['Move funds between your bot wallets.']),
			keyboard: buildKeyboard(args.chains, actionIds.openWallet),
		}
	},

	renderDraftEdit(args: {
		chains: Chain[]
		srcCurrency: CurrencyDto
		dstCurrency: CurrencyDto
		amountIn: bigint
	}): PageContent {
		const { chains, srcCurrency, dstCurrency, amountIn } = args

		return {
			message: buildMessage(
				draftLines(srcCurrency, dstCurrency, amountIn),
			),
			keyboard: buildKeyboard(chains, actionIds.openSwapCheckout),
		}
	},
}

function buildMessage(contextLines: string[]): FormattedString {
	const lines: Line[] = [
		swapBreadcrumb(),
		'',
		...contextLines,
		'',
		'Choose source chain:',
	]

	return joinLines(lines)
}

function draftLines(
	srcCurrency: CurrencyDto,
	dstCurrency: CurrencyDto,
	amountIn: bigint,
): string[] {
	const amount = toCurrencyAmount(amountIn, srcCurrency)
	const { displayAmount } = currencyAmountDisplayParts(amount)
	const dstChainName = currencyToChainName(dstCurrency)

	return [
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		`Amount: ${displayAmount}`,
	]
}

function buildKeyboard(
	chains: Chain[],
	parentActionId: ActionId,
): InlineKeyboard {
	const keyboard = buildChainKeyboard(
		chains,
		actionIds.openSwapChooseSrcToken,
	)

	return keyboard.appendNavButtons({
		parent: parentActionId,
		home: actionIds.openHome,
	})
}
