import { Flow } from '../flows'
import { SessionData } from '../types'
import { ErrorToRender } from '../utils/error-to-render'

type ActiveFlow = NonNullable<Flow>

type FlowByType<FT extends ActiveFlow['flowType']> = Extract<
	ActiveFlow,
	{ flowType: FT }
>

type StepOf<FT extends ActiveFlow['flowType']> = FlowByType<FT>['step']

type ValidateStep<
	FT extends ActiveFlow['flowType'],
	S extends ActiveFlow['step'],
> = S extends StepOf<FT> ? S : StepOf<FT>

export function assertFlow<
	FT extends ActiveFlow['flowType'],
	S extends ActiveFlow['step'],
>(
	session: SessionData,
	flowType: FT,
	...steps: ValidateStep<FT, S>[]
): asserts session is SessionData<
	Extract<ActiveFlow, { flowType: FT; step: S }>
> {
	const { flow } = session

	if (flow?.flowType !== flowType || !steps.includes(flow.step)) {
		throw new ErrorToRender('Invalid session state')
	}
}

export function setFlowStep<
	FT extends ActiveFlow['flowType'],
	S extends FlowByType<FT>['step'],
>(
	session: SessionData<FlowByType<FT>>,
	step: S,
	data: Extract<FlowByType<FT>, { step: S }>['data'],
) {
	session.flow = {
		flowType: session.flow.flowType,
		step,
		data,
	}
}

export function resetFlow(session: SessionData<ActiveFlow>) {
	session.flow = null
}

export function setFlow<
	FT extends ActiveFlow['flowType'],
	S extends StepOf<FT>,
>(
	session: SessionData,
	flowType: FT,
	step: S,
	data: Extract<FlowByType<FT>, { step: S }>['data'],
) {
	session.flow = { flowType, step, data }
}
