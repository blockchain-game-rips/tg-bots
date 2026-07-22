import { fmt } from '@rips/grammy-kit'
import { PromptContent } from '../types'

export const CustomEntryAmountPrompt = {
	render(): PromptContent {
		return {
			placeholder: '10',
			message: fmt`Specify the entry amount`,
		}
	},
}
