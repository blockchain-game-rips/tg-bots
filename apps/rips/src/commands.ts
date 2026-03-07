const COMMAND_SEPARATOR = ':'

export type Command = { type: 'open'; pageId: string }

export function buildCommand(command: Command): string {
	switch (command.type) {
		case 'open':
			return `o${COMMAND_SEPARATOR}${command.pageId}`
	}
}

export function parseCommand(data: string): Command {
	const separatorIndex = data.indexOf(COMMAND_SEPARATOR)
	const prefix = data.slice(0, separatorIndex)
	const payload = data.slice(separatorIndex + 1)

	switch (prefix) {
		case 'o':
			return { type: 'open', pageId: payload }
		default:
			throw new Error(`Unknown command prefix: ${prefix}`)
	}
}
