import { PromptContent } from '../pages/interfaces'

export class CustomTicketAmountPrompt {
	static render(): PromptContent {
		return {
			placeholder: '10',
			message: 'Specify the ticket amount',
		}
	}
}
