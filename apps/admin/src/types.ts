import { User } from '@grammyjs/types'
import { Context as GrammyContext, SessionFlavor } from 'grammy'
import { Flow } from './flows'

export {
	ActionId,
	Chain,
	Effect,
	EffectAsk,
	EffectEdit,
	EffectLoading,
	EffectType,
	MessageToEdit,
	PageContent,
	PromptContent,
	SessionData,
} from '@rips/grammy-kit'

import { SessionData } from '@rips/grammy-kit'

export type Context = GrammyContext &
	SessionFlavor<SessionData<Flow>> & { from: User }

export type NavIds = {
	home: string
	parent: string
	parentPayload?: string
}

export type Row = 'row'

export type StaticButton = {
	label: string
	actionId: string
	payload?: string
}

export type KeyboardLayout = StaticButton[][]
