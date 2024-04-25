import { Nullable, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";

export interface StateChangeArgs<State> {
	stateKey: string;
	oldState: Partial<State>;
	newState: State;
}

export interface StateChangeSubscriptions<StateChangeArgs> {
	[uniqueId: string]: Nullable<{
		onStateUpdated: (args: StateChangeArgs) => void;

		// true to get all update, false to get no updates, function to get updates selectively
		getUpdates: ValueOrCallbackWithArgs<StateChangeArgs, boolean>;
	}>
}

export interface StateEntry<State, TStateChangeArgs = StateChangeArgs<State>> {
	readonly stateKey: string;
	state: State;

	// subscribed hooks to this entry to be updated on change
	readonly stateSubscriptions: StateChangeSubscriptions<TStateChangeArgs>;
}
