const COMMAND_SEPARATOR = ':'

export type Command = { type: 'open'; pageId: string; payloads?: string[] }

export function buildCommand(command: Command): string {
	let commandStr = ''

	switch (command.type) {
		case 'open':
			commandStr = `o${COMMAND_SEPARATOR}${command.pageId}`

			for (const payload of command.payloads || []) {
				commandStr += `${COMMAND_SEPARATOR}${payload}`
			}

			break
	}

	return commandStr
}

export function parseCommand(data: string): Command {
	const [prefix, ...payloads] = data.split(COMMAND_SEPARATOR)

	switch (prefix) {
		case 'o':
			return {
				type: 'open',
				pageId: payloads[0],
				payloads: payloads.slice(1),
			}
		default:
			throw new Error(`Unknown command prefix: ${prefix}`)
	}
}
