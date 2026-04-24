import { walletsControllerCreateWithdrawal } from '../../generated/api-client'
import { NATIVE_ON_BASE } from '../constants'
import { WithdrawPage } from '../pages/content/wallet/withdraw-page'
import { WithdrawSuccessPage } from '../pages/content/wallet/withdraw-success-page'
import { CustomWithdrawAmountPrompt } from '../prompts/custom-withdraw-amount-prompt'
import { WithdrawAddressPrompt } from '../prompts/withdraw-address-prompt'
import {
	ActiveFlow,
	Context,
	MessageToEdit,
	PageContent,
	WithdrawStep,
} from '../types'
import { fetchNativeBalance } from '../utils/units'

export async function enterWithdrawPage(
	ctx: Context,
	messageToEdit: MessageToEdit,
	amount?: string,
	recipientAddress?: string,
): Promise<PageContent> {
	const telegramId = String(ctx.from.id)

	const balance = await fetchNativeBalance(telegramId)

	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.OnWithdrawPage,
		messageToEdit,
		amount,
		recipientAddress,
	}

	return WithdrawPage.render(balance, amount, recipientAddress)
}

export async function enterChoosingRecipientStep(
	ctx: Context,
	messageToEdit: MessageToEdit,
	amount?: string,
): Promise<void> {
	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.WaitingForRecipient,
		messageToEdit,
		amount,
	}

	const promptContent = WithdrawAddressPrompt.render()

	await ctx.reply(promptContent.message, {
		reply_markup: {
			force_reply: true,
			input_field_placeholder: promptContent.placeholder,
		},
	})
}

export async function enterChoosingCustomAmountStep(
	ctx: Context,
	messageToEdit: MessageToEdit,
	recipientAddress?: string,
): Promise<void> {
	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.WaitingForCustomAmount,
		messageToEdit,
		recipientAddress,
	}

	const promptContent = CustomWithdrawAmountPrompt.render()

	await ctx.reply(promptContent.message, {
		reply_markup: {
			force_reply: true,
			input_field_placeholder: promptContent.placeholder,
		},
	})
}

export async function enterWithdrawalStep(
	ctx: Context,
	amount: string,
	recipientAddress: string,
): Promise<PageContent> {
	const telegramId = String(ctx.from.id)

	const { data } = await walletsControllerCreateWithdrawal({
		headers: { 'x-telegram-id': telegramId },
		body: {
			amountIn: {
				amount: amount,
				currencyChainAddress: NATIVE_ON_BASE,
			},
			recipientAddress,
			currencyOutChainAddress: NATIVE_ON_BASE,
		},
		throwOnError: true,
	})

	ctx.session = { activeFlow: null }

	return WithdrawSuccessPage.render(data)
}
