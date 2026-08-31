import { buildActions } from '@rips/grammy-kit'
import { actionIds } from './action-ids'
import { actionRegistry } from './action-registry'

export const actions = buildActions(actionIds, actionRegistry)
