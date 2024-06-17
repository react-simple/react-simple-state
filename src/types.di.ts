import { ChildMemberInfoWithCallbacks } from "@react-simple/react-simple-mapping";
import { Guid, ValueOrCallback, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import {
	GlobalStateChangeArgs, GlobalStateChangeFilter, GlobalStateChangeFilters, GlobalStateSubscription, GlobalStateSubscriptionsEntry
	
 } from "subscription/types";
import { GlobalStateRoot, SetStateOptions } from "types";

export interface ReactSimpleStateDependencyInjection {
	subscription: {
		getGlobalStateSubscriptionsMemberInfo: (
			fullQualifiedName: string,
			createEntryIfMissing: boolean, // if set won't return undefined
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["getGlobalStateSubscriptionsMemberInfo"]
		) => ChildMemberInfoWithCallbacks<GlobalStateSubscriptionsEntry> | undefined;
		
		getGlobalStateSubscriptions: (
			fullQualifiedName: string,
			createEntryIfMissing: boolean, // if set won't return undefined
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["getGlobalStateSubscriptions"]
		) => GlobalStateSubscriptionsEntry | undefined;

		subscribeToGlobalState: <State>(
			uniqueId: Guid,
			subscription: Omit<GlobalStateSubscription<State>, "subscribedState"> & { subscribedState?: Partial<GlobalStateChangeFilters<State>> },
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["subscribeToGlobalState"]
		) => void;

		unsubscribeFromGlobalState: (
			uniqueId: Guid,
			stateFullQualifiedName: string,
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["unsubscribeFromGlobalState"]
		) => void;

		globalStateUpdateSubscribedComponents: <State>(
			changeArgs: GlobalStateChangeArgs<State>,
			options: SetStateOptions<State>,
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["globalStateUpdateSubscribedComponents"]
		) => void;

		evaluateGlobalStateComponentChangeTrigger: <State>(
			trigger: GlobalStateChangeFilter<State>,
			changeArgs: GlobalStateChangeArgs<State>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["evaluateGlobalStateComponentChangeTrigger"]
		) => boolean;
	};

	globalState: {
		getGlobalState: <State = unknown>(
			stateFullQualifiedName: string, // full qualified child path
			defaultValue: ValueOrCallback<State>,
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["getGlobalState"]
		) => State;

		getGlobalStateOrEmpty: <State = unknown>(
			stateFullQualifiedName: string, // full qualified child path
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["getGlobalStateOrEmpty"]
		) => State | undefined;

		setGlobalState: <State = unknown>(
			stateFullQualifiedName: string, // full qualified child path
			state: ValueOrCallbackWithArgs<State | undefined, State>,
			options: SetStateOptions<State>,
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["setGlobalState"]
		) => State;

		initGlobalState: <State = unknown>(
			stateFullQualifiedName: string, // full qualified child path
			state: ValueOrCallback<State>,
			options: Omit<SetStateOptions<State>, "customMerge">,
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["initGlobalState"]
		) => State;

		removeGlobalState: (
			statePaths: string | string[], // full qualified child path
			globalStateRoot: GlobalStateRoot,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["removeGlobalState"]
		) => void;
	};
}
