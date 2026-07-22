import { fmt } from '@rips/grammy-kit'
import { PromptContent } from '../types'

export const CustomWithdrawAmountPrompt = {
	render(): PromptContent {
		return {
			message: fmt`Enter the amount to withdraw`,
			placeholder: '0.01',
		}
	},
}
