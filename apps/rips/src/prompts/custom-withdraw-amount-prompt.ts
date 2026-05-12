import { PromptContent } from '../types'

export const CustomWithdrawAmountPrompt = {
	render(): PromptContent {
		return {
			message: 'Enter the amount to withdraw',
			placeholder: '0.01',
		}
	},
}
