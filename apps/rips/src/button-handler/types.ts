export type OpenCommand = { type: 'open'; pageId: string; payloads: string[] }
export type ReplyCommand = { type: 'reply'; promptId: string }
export type Command = OpenCommand | ReplyCommand
