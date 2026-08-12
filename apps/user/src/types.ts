import { User } from '@grammyjs/types'
import { Context as GrammyContext, SessionFlavor } from 'grammy'
import { Flow } from './flows'

export {
	ActionId,
	Effect,
	EffectAsk,
	EffectNavigate,
	EffectType,
	HandlerResult,
	NavIds,
	PageContent,
	PromptContent,
	SessionData,
} from '@rips/grammy-kit'

import { EffectLoading as _EffectLoading, SessionData } from '@rips/grammy-kit'

export type Context = GrammyContext &
	SessionFlavor<SessionData<Flow>> & { from: User }

export type EffectLoading = _EffectLoading<Flow>
