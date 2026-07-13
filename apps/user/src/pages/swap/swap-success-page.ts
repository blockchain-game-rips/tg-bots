import {
	CurrencyAmountDto,
	GetSwapResultResponseDtoOutput,
	SwapResponseDtoOutput,
	SwapSamechainResponseDtoOutput,
} from '@rips/api-client'
import { currencyAmountDisplayParts } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'

interface SamechainResult {
	kind: 'samechain'
	result: SwapSamechainResponseDtoOutput
}

interface CrosschainResult {
	kind: 'crosschain'
	swapResponse: SwapResponseDtoOutput
	result: NonNullable<GetSwapResultResponseDtoOutput['success']>
}

type SwapSuccessResult = SamechainResult | CrosschainResult

export const SwapSuccessPage = {
	render(result: SwapSuccessResult): PageContent {
		const lines = [
			'✅ Swap succeeded',
			'',
			'You received:',
			formatAmount(amountOut(result)),
			'',
			...networkFeeLines(result),
			...transactionLines(result),
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}

function amountOut(result: SwapSuccessResult): CurrencyAmountDto {
	return result.result.amountOut
}

function networkFee(result: SwapSuccessResult): CurrencyAmountDto | undefined {
	if (result.kind === 'samechain') return result.result.transaction.cost

	return result.result.dstTransaction.cost
}

function networkFeeLines(result: SwapSuccessResult): string[] {
	const cost = networkFee(result)

	if (cost === undefined) return []

	return ['Network fee:', formatAmount(cost), '']
}

function formatAmount(amount: CurrencyAmountDto): string {
	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol} ≈ ${displayUsdAmount}`
}

function transactionLines(result: SwapSuccessResult): string[] {
	if (result.kind === 'samechain') {
		return ['Transaction:', `<code>${result.result.transaction.id}</code>`]
	}

	const { swapResponse } = result

	const srcChainName = chainToName(
		swapResponse.amountIn.currency.chainAddress.chain,
	)
	const dstChainName = chainToName(
		result.result.amountOut.currency.chainAddress.chain,
	)

	return [
		`Transaction on ${srcChainName}:`,
		`<code>${swapResponse.srcTransaction.id}</code>`,
		'',
		`Transaction on ${dstChainName}:`,
		`<code>${result.result.dstTransaction.id}</code>`,
	]
}
