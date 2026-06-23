import { PromptContent } from '../types'

export const CustomEntryAmountPrompt = {
	render(): PromptContent {
		return {
			placeholder: '10',
			message: 'Specify the entry amount',
		}
	},
}
