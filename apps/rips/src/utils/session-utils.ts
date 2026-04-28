import { Flow } from '../flows'
import { SessionData } from '../types'
import { ErrorToRender } from '../utils/error-to-render'

type NonNullableFlow = NonNullable<Flow>

type ExtractFlowData<
	FT extends NonNullableFlow['flowType'],
	S extends NonNullableFlow['step'],
> = Extract<NonNullableFlow, { flowType: FT; step: S }>['data']

export function getFlowData<
	FT extends NonNullableFlow['flowType'],
	S extends Extract<
		NonNullableFlow & { flowType: FT },
		NonNullableFlow
	>['step'],
>(session: SessionData, flowType: FT, step: S): ExtractFlowData<FT, S> {
	const { flow } = session

	if (flow?.flowType === flowType && flow.step === step) {
		return flow.data as ExtractFlowData<FT, S>
	}

	throw new ErrorToRender('Invalid session state')
}
