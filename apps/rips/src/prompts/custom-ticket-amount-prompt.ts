import { PromptContent } from '../types'

export const CustomTicketAmountPrompt = {
	render(): PromptContent {
		return {
			placeholder: '10',
			message: 'Specify the ticket amount',
		}
	},
}
