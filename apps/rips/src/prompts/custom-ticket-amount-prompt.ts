import { PromptContent } from '../pages/interfaces'

export class CustomTicketAmountPrompt {
	render(): PromptContent {
		return {
			placeholder: '10',
			message: 'Specify the ticket amount',
		}
	}
}
