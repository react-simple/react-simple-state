import { LogLevel, Nullable, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { ReactSimpleStateDependencyInjection } from "types.di";

export interface ReactSimpleState {
	readonly ROOT_CONTEXT_ID: string;
	LOGGING: {
		logLevel: LogLevel; // for functions in react-simple-state
	};
	DI: ReactSimpleStateDependencyInjection;
}

export interface StateChangeArgs<State> {
	stateKey: string;
	oldState: State | undefined; // during initialization by default value, we have no previous state
	newState: State;
}

export interface StateChangeSubscription<StateChangeArgs> {
	readonly onStateUpdated: (args: StateChangeArgs) => void;

	// true to get all update, false to get no updates, function to get updates selectively
	readonly updateFilter: ValueOrCallbackWithArgs<StateChangeArgs, boolean>;
}

export interface StateEntry<State, TStateChangeArgs = StateChangeArgs<State>> {
	readonly stateKey: string;
	state: State;

	// subscribed hooks to this entry to be updated on change
	readonly stateSubscriptions: { [uniqueId: string]: Nullable<StateChangeSubscription<TStateChangeArgs>> };
}

export type StateSetter<State> = (
	state: ValueOrCallbackWithArgs<State, Partial<State>>,
	customMerge?: (oldState: State, newState: Partial<State>) => State
) => State;

export type StateReturn<State> = [State, StateSetter<State>];
