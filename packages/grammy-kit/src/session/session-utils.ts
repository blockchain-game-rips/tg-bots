import { ActionContext } from '../action/action-def'
import { ErrorToRender } from '../effects/error-to-render'
import { SessionData } from '../types'

export interface FlowBase {
	flowType: string
	step: string
	data: unknown
}

const INACTIVE_FLOW_MESSAGE =
	'This is no longer available. Send /start to begin again.'

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
	actionContext: ActionContext<F>,
	flowType: FT,
	...steps: S[]
): asserts actionContext is ActionContext<FlowByTypeAndStep<F, FT, S>> {
	const { flow } = actionContext

	const stepMatches =
		flow !== null &&
		flow.flowType === flowType &&
		(steps as ActiveFlow<F>['step'][]).includes(flow.step)

	if (!stepMatches) {
		throw new ErrorToRender(INACTIVE_FLOW_MESSAGE)
	}
}

export function isFlow<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends StepOf<F, FT>,
>(
	actionContext: ActionContext<F>,
	flowType: FT,
	...steps: S[]
): actionContext is ActionContext<FlowByTypeAndStep<F, FT, S>> {
	const { flow } = actionContext

	return (
		flow !== null &&
		flow.flowType === flowType &&
		(steps as ActiveFlow<F>['step'][]).includes(flow.step)
	)
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

const SET = 'set'
const RESET = 'reset'
const HOLD = 'hold'

export type FlowTransition<F extends FlowBase | null> =
	| { kind: typeof SET; flow: NonNullable<F> }
	| { kind: typeof RESET }
	| { kind: typeof HOLD }

export function toStep<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends StepOf<F, FT>,
>(
	current: FlowByType<F, FT>,
	step: S,
	data: DataOf<F, FT, S>,
): FlowTransition<F> {
	const flow = {
		flowType: current.flowType,
		step,
		data,
	} as unknown as NonNullable<F>

	return { kind: SET, flow }
}

export function toFlow<
	F extends FlowBase | null,
	FT extends ActiveFlow<F>['flowType'],
	S extends StepOf<F, FT>,
>(flowType: FT, step: S, data: DataOf<F, FT, S>): FlowTransition<F> {
	const flow = { flowType, step, data } as unknown as NonNullable<F>

	return { kind: SET, flow }
}

export function toReset<F extends FlowBase | null>(): FlowTransition<F> {
	return { kind: RESET }
}

export function toHold<F extends FlowBase | null>(): FlowTransition<F> {
	return { kind: HOLD }
}

export function createFlowTransitions<F extends FlowBase | null>() {
	return {
		toFlow: <FT extends ActiveFlow<F>['flowType'], S extends StepOf<F, FT>>(
			flowType: FT,
			step: S,
			data: DataOf<F, FT, S>,
		) => toFlow<F, FT, S>(flowType, step, data),

		toStep: <FT extends ActiveFlow<F>['flowType'], S extends StepOf<F, FT>>(
			current: FlowByType<F, FT>,
			step: S,
			data: DataOf<F, FT, S>,
		) => toStep<F, FT, S>(current, step, data),

		toHold: () => toHold<F>(),

		toReset: () => toReset<F>(),
	}
}

export function applyFlowTransition<F extends FlowBase | null>(
	session: SessionData<F>,
	transition: FlowTransition<F>,
): void {
	if (transition.kind === HOLD) {
		return
	}

	if (transition.kind === SET) {
		session.flow = transition.flow

		return
	}

	session.flow = null as F
}
