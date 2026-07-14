import { PromptContent } from '../types'

export const CustomSwapAmountPrompt = {
	render(): PromptContent {
		return {
			message: 'Enter the amount to swap',
			placeholder: '0.01',
		}
	},
}
