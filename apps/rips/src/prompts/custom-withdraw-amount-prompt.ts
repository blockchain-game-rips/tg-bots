import { PromptContent } from '../types'

export class CustomWithdrawAmountPrompt {
	static render(): PromptContent {
		return {
			message: 'Enter the amount to withdraw',
			placeholder: '0.01',
		}
	}
}
