import { ObjectCompareOptions, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { GlobalStateUpdateFilter, GlobalStateUpdateFilterSelector } from "subscriptions";
import { SetGlobalStateOptions } from "types";

export type UseGlobalStateUpdateFilter<State> =
	| false // never update
	| true // always update (this, parent, child state changes); same as undefined
	| (GlobalStateUpdateFilter<State> & {
		objectCompareOptions?: ObjectCompareOptions<boolean>;
		selector?: GlobalStateUpdateFilterSelector<State, unknown>; // only update if this child member changes
		compareState?: boolean; // compare new state with old state to filter updates
	});

export interface UseGlobalStateSetChildStateCallback {
	// it's possible to set a child member of state to minimize updates of other components
	childMemberFullQualifiedName: string;
	state: unknown | (<ChildState>(oldState: ChildState) => Partial<ChildState>);
}

export type UseGlobalStateSetStateCallback<State> = (
	newState: ValueOrCallbackWithArgs<State, Partial<State>> | UseGlobalStateSetChildStateCallback,
	options?: SetGlobalStateOptions<State>
) => State;
