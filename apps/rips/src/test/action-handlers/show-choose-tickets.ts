import { z } from 'zod'
import { ErrorToRender } from '../../utils/error-to-render'
import { ChooseTicketsPage } from '../pages/choose-tickets-page'
import { Effect, EffectType, SessionData } from '../types'

const stakeIdSchema = z
	.string()
	.transform(Number)
	.pipe(z.number().int().positive())

export async function showChooseTickets(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const stakeId = parsePayload(payload)

	session.flow = {
		flowType: 'buyTickets',
		step: 'stake-chosen',
		data: {
			stakeId,
		},
	}

	return {
		type: EffectType.EDIT,
		page: ChooseTicketsPage.render(stakeId),
	}
}

function parsePayload(payload: string | undefined) {
	const result = stakeIdSchema.safeParse(payload)

	if (!result.success) {
		throw new ErrorToRender('No stake selected')
	}

	return result.data
}
