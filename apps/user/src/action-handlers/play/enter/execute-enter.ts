import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../../action-def'

export const executeEnter: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'at-checkout')

	throw new Error('TODO: implement')
})
