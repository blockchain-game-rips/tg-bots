import { z } from 'zod'
import { SwapSelecting } from '../flows'
import { parsePayload } from './parse-payload'

const swapSelectingSchema = z.enum(['in', 'out'])

export function parseSwapSelecting(payload: string | undefined): SwapSelecting {
	return parsePayload(payload, swapSelectingSchema, 'Invalid swap selecting')
}
