import { fmt } from '@rips/grammy-kit'
import { PromptContent } from '../types'

export const CustomSwapAmountPrompt = {
	render(): PromptContent {
		return {
			message: fmt`Enter the amount to swap`,
			placeholder: '0.01',
		}
	},
}
