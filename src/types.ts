import { Nullable, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { ReactSimpleStateDependencyInjection } from "types.di";

export interface StateChangeArgs<State> {
	stateKey: string;
	oldState: Partial<State>;
	newState: State;
}

export interface StateChangeSubscription<StateChangeArgs> {
	readonly onStateUpdated: (args: StateChangeArgs) => void;

	// true to get all update, false to get no updates, function to get updates selectively
	readonly getUpdates: ValueOrCallbackWithArgs<StateChangeArgs, boolean>;
}

export interface StateEntry<State, TStateChangeArgs = StateChangeArgs<State>> {
	readonly stateKey: string;
	state: State;

	// subscribed hooks to this entry to be updated on change
	readonly stateSubscriptions: { [uniqueId: string]: Nullable<StateChangeSubscription<TStateChangeArgs>> };
}

export interface ReactSimpleState {
	readonly ROOT_CONTEXT_ID: string;
	readonly DI: ReactSimpleStateDependencyInjection;
}
