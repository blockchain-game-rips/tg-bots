import { ErrorToRender } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'

export const openSwap: ActionDef<void> = noPayload(() => {
	// TODO: implement swap flow
	throw new ErrorToRender('Swap is temporarily unavailable')
})
