import { ChildMemberInfoWithCallbacks } from "@react-simple/react-simple-mapping";
import { Guid, Optional, ValueOrCallback, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { GlobalStateChangeArgs, GlobalStateSubscription, GlobalStateSubscriptionsEntry } from "subscriptions/types";
import { GlobalStateRoot, RemoveGlobalStateOptions, SetGlobalStateOptions } from "types";

export interface ReactSimpleStateDependencyInjection {
	subscription: {
		getGlobalStateSubscriptionsMemberInfo: <State>(
			fullQualifiedName: string,
			createEntryIfMissing: boolean, // if set won't return undefined
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["getGlobalStateSubscriptionsMemberInfo"]
		) => ChildMemberInfoWithCallbacks<GlobalStateSubscriptionsEntry<State>> | undefined;
		
		getGlobalStateSubscriptions: <State>(
			fullQualifiedName: string,
			createEntryIfMissing: boolean, // if set won't return undefined
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["getGlobalStateSubscriptions"]
		) => GlobalStateSubscriptionsEntry<State> | undefined;

		subscribeToGlobalState: <State>(
			uniqueId: Guid,
			subscription: Optional<GlobalStateSubscription<State>, "updateFilter">,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["subscribeToGlobalState"]
		) => void;

		unsubscribeFromGlobalState: (
			uniqueId: Guid,
			fullQualifiedName: string,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["unsubscribeFromGlobalState"]
		) => void;

		updateGlobalStateSubscribedComponents: <State>(
			changeArgs: GlobalStateChangeArgs<State>,
			options: SetGlobalStateOptions<State>,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["updateGlobalStateSubscribedComponents"]
		) => void;
	};

	globalState: {
		mergeGlobalState: <State>(
			oldState: State | undefined,
			newState: Partial<State>,
			mergeState: ((oldState: State | undefined, newState: Partial<State>) => Partial<State>) | undefined,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["mergeGlobalState"]
		) => Partial<State>;

		getGlobalState: <State>(
			fullQualifiedName: string, // full qualified child path
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["getGlobalState"]
		) => State | undefined;

		setGlobalState: <State>(
			fullQualifiedName: string, // full qualified child path
			state: ValueOrCallbackWithArgs<State | undefined, Partial<State>>,
			options: SetGlobalStateOptions<State>,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["setGlobalState"]
		) => Partial<State>;

		initGlobalState: <State>(
			fullQualifiedName: string, // full qualified child path
			state: ValueOrCallback<State>,
			options: Omit<SetGlobalStateOptions<State>, "customMerge">,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["initGlobalState"]
		) => State;

		removeGlobalState: (
			fullQualifiedNames: string | string[], // full qualified child path
			options: RemoveGlobalStateOptions,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["removeGlobalState"]
		) => void;
	};
}
