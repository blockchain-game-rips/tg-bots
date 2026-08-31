import { declareActions, toLockfile } from '@rips/grammy-kit'
import { actionDeclarations } from './action-declarations'
import actionIdsJson from './action-ids.json'

/**
 * The id each action's buttons carry, taken from the committed lockfile rather
 * than the action's position, so adding or removing an action leaves every
 * other id untouched.
 */
export const actionIds = declareActions(
	toLockfile(actionIdsJson),
	actionDeclarations,
)
