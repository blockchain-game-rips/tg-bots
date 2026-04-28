import { FlowData, SessionData } from './types'
import { ErrorToRender } from './utils/error-to-render'

type Flow = NonNullable<FlowData>

type ExtractFlowData<
	FT extends Flow['flowType'],
	S extends Flow['step'],
> = Extract<Flow, { flowType: FT; step: S }>['data']

export function getFlowData<
	FT extends Flow['flowType'],
	S extends Extract<Flow & { flowType: FT }, Flow>['step'],
>(session: SessionData, flowType: FT, step: S): ExtractFlowData<FT, S> {
	const { flow } = session

	if (flow?.flowType === flowType && flow.step === step) {
		return flow.data as ExtractFlowData<FT, S>
	}

	throw new ErrorToRender('Invalid session state')
}
