import { ErrorToRender } from '../effects/error-to-render'
import { SessionData } from '../types'

export interface FlowBase {
	flowType: string
	step: string
	data: unknown
}

type ActiveFlow<F extends FlowBase | null> = NonNullable<F>

type FlowByType<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
> = Extract<ActiveFlow<F>, { flowType: FT }>

type FlowByTypeAndStep<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends ActiveFlow<F>['step'],
> = Extract<ActiveFlow<F>, { flowType: FT; step: S }>

type StepOf<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
> = FlowByType<F, FT>['step']

type DataOf<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends ActiveFlow<F>['step'],
> = FlowByTypeAndStep<F, FT, S>['data']

export function assertFlow<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends StepOf<F, FT>,
>(
	session: SessionData<F>,
	flowType: FT,
	...steps: S[]
): asserts session is SessionData<FlowByTypeAndStep<F, FT, S>> {
	const { flow } = session

	const stepMatches =
		flow !== null &&
		flow.flowType === flowType &&
		(steps as ActiveFlow<F>['step'][]).includes(flow.step)

	if (!stepMatches) {
		throw new ErrorToRender('Invalid session state')
	}
}

export function setFlowStep<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends StepOf<F, FT>,
>(session: SessionData<FlowByType<F, FT>>, step: S, data: DataOf<F, FT, S>) {
	session.flow = {
		flowType: session.flow.flowType,
		step,
		data,
	} as unknown as FlowByType<F, FT>
}

export function resetFlow<F extends FlowBase | null>(session: SessionData<F>) {
	session.flow = null as F
}

export function setFlow<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends StepOf<F, FT>,
>(session: SessionData<F>, flowType: FT, step: S, data: DataOf<F, FT, S>) {
	session.flow = { flowType, step, data } as FlowByTypeAndStep<F, FT, S>
}
