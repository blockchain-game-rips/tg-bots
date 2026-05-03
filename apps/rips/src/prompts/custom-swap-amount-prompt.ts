import { PromptContent } from '../types'

export class CustomSwapAmountPrompt {
	static render(): PromptContent {
		return {
			message: 'Enter the amount to swap',
			placeholder: '0.01',
		}
	}
}
