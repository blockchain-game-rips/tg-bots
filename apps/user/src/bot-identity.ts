let botUsername: string | null = null

export function setBotUsername(username: string) {
	botUsername = username
}

function getBotUsername(): string {
	if (botUsername === null) throw new Error('Bot username not resolved yet')

	return botUsername
}

export function botStartLink(payload?: string): string {
	const base = `https://t.me/${getBotUsername()}?start`

	return payload === undefined ? base : `${base}=${payload}`
}
