import {
	walletsControllerCreateWithdrawal,
	walletsControllerGetBalances,
} from '../../generated/api-client'
import { NATIVE_ON_BASE } from '../constants'
import { SuccessWithdrawPage } from '../pages/content/success-withdraw-page'
import { WithdrawPage } from '../pages/content/withdraw-page'
import { CustomWithdrawAmountPrompt } from '../prompts/custom-withdraw-amount-prompt'
import { WithdrawAddressPrompt } from '../prompts/withdraw-address-prompt'
import { ActiveFlow, Context, PageContent, WithdrawStep } from '../types'
import { chainAddressToString } from '../utils/units'

type MessageToEdit = { pageContent: PageContent; messageId: number }

async function getBalance(telegramId: string) {
	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: [chainAddressToString(NATIVE_ON_BASE)] },
		throwOnError: true,
	})

	const balance = data.balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	return balance
}

export async function enterWithdrawPage(
	ctx: Context,
	messageToEdit: MessageToEdit,
	amount?: string,
	recipientAddress?: string,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)
	const balance = await getBalance(telegramId)

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
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)

	const { data } = await walletsControllerCreateWithdrawal({
		headers: { 'x-telegram-id': telegramId },
		body: {
			amount,
			currencyChainAddress: NATIVE_ON_BASE,
			recipientAddress,
		},
		throwOnError: true,
	})

	ctx.session = { activeFlow: null }

	return SuccessWithdrawPage.render(data)
}
