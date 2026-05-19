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
	NavIds,
	PageContent,
	PromptContent,
	SessionData,
} from '@rips/grammy-kit'

import { SessionData } from '@rips/grammy-kit'

export type Context = GrammyContext &
	SessionFlavor<SessionData<Flow>> & { from: User }
