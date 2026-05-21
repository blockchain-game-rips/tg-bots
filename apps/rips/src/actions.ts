import { buildActionIds, buildActions } from '@rips/grammy-kit'
import { actionRegistry } from './action-registry'

export const actionIds = buildActionIds(actionRegistry)

export const actions = buildActions(actionRegistry)
