import { Api } from 'grammy'
import { PromptContent } from '../types'

export async function sendPrompt(
	api: Api,
	chatId: number,
	prompt: PromptContent,
): Promise<number> {
	const res = await api.sendMessage(chatId, prompt.message.text, {
		reply_markup: {
			force_reply: true,
			input_field_placeholder: prompt.placeholder,
		},
		entities: prompt.message.entities,
	})

	return res.message_id
}
