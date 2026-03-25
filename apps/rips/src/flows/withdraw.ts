import { getMainCurrencyPrice } from '../api/endpoints/price'
import { getBalance, withdraw } from '../api/endpoints/wallets'
import { SuccessWithdrawPage } from '../pages/content/success-withdraw-page'
import { WithdrawPage } from '../pages/content/withdraw-page'
import { CustomWithdrawAmountPrompt } from '../prompts/custom-withdraw-amount-prompt'
import { WithdrawAddressPrompt } from '../prompts/withdraw-address-prompt'
import { ActiveFlow, Context, PageContent, WithdrawStep } from '../types'

type MessageToEdit = { pageContent: PageContent; messageId: number }

export async function enterWithdrawPage(
	ctx: Context,
	messageToEdit: MessageToEdit,
	price: number,
	amount?: string,
	recipientAddress?: string,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const balance = await getBalance(telegramId)

	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.OnWithdrawPage,
		messageToEdit,
		amount,
		recipientAddress,
	}

	return WithdrawPage.render(balance, price, amount, recipientAddress)
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

	const telegramId = BigInt(ctx.from.id)
	const [result, balance, { price }] = await Promise.all([
		withdraw(telegramId, BigInt(amount), recipientAddress),
		getBalance(telegramId),
		getMainCurrencyPrice(),
	])

	ctx.session = { activeFlow: null }

	return SuccessWithdrawPage.render(result, BigInt(amount), balance, price)
}
