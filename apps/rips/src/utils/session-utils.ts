import { Flow } from '../flows'
import { SessionData } from '../types'
import { ErrorToRender } from '../utils/error-to-render'

type ActiveFlow = NonNullable<Flow>

type FlowByType<FT extends ActiveFlow['flowType']> = Extract<
	ActiveFlow,
	{ flowType: FT }
>

type FlowByTypeAndStep<
	FT extends ActiveFlow['flowType'],
	S extends ActiveFlow['step'],
> = Extract<ActiveFlow, { flowType: FT; step: S }>

type StepOf<FT extends ActiveFlow['flowType']> = FlowByType<FT>['step']

type DataOf<
	FT extends ActiveFlow['flowType'],
	S extends ActiveFlow['step'],
> = FlowByTypeAndStep<FT, S>['data']

export function assertFlow<
	FT extends ActiveFlow['flowType'],
	S extends StepOf<FT>,
>(
	session: SessionData,
	flowType: FT,
	...steps: S[]
): asserts session is SessionData<FlowByTypeAndStep<FT, S>> {
	const { flow } = session

	const stepMatches =
		flow !== null &&
		flow.flowType === flowType &&
		(steps as ActiveFlow['step'][]).includes(flow.step)

	if (!stepMatches) {
		throw new ErrorToRender('Invalid session state')
	}
}

export function setFlowStep<
	FT extends ActiveFlow['flowType'],
	S extends StepOf<FT>,
>(session: SessionData<FlowByType<FT>>, step: S, data: DataOf<FT, S>) {
	session.flow = {
		flowType: session.flow.flowType,
		step,
		data,
	} as FlowByType<FT>
}

export function resetFlow(session: SessionData) {
	session.flow = null
}

export function setFlow<
	FT extends ActiveFlow['flowType'],
	S extends StepOf<FT>,
>(session: SessionData, flowType: FT, step: S, data: DataOf<FT, S>) {
	session.flow = { flowType, step, data } as FlowByTypeAndStep<FT, S>
}
