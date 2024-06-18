import { ChildMemberInfoWithCallbacks } from "@react-simple/react-simple-mapping";
import { Guid, ValueOrCallback, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import {
	GlobalStateChangeArgs, GlobalStateUpdateConditions, GlobalStateSubscription, GlobalStateSubscriptionsEntry	
 } from "subscription/types";
import { GlobalStateRoot, RemoveStateOptions, SetStateOptions } from "types";

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
			subscription: Omit<GlobalStateSubscription<State>, "subscribedState"> & { subscribedState?: Partial<GlobalStateUpdateConditions<State>> },
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["subscribeToGlobalState"]
		) => void;

		unsubscribeFromGlobalState: (
			uniqueId: Guid,
			fullQualifiedName: string,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["unsubscribeFromGlobalState"]
		) => void;

		globalStateUpdateSubscribedComponents: <State>(
			changeArgs: GlobalStateChangeArgs<State>,
			options: SetStateOptions<State>,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["subscription"]["globalStateUpdateSubscribedComponents"]
		) => void;
	};

	globalState: {
		getGlobalState: <State>(
			fullQualifiedName: string, // full qualified child path
			defaultState: ValueOrCallback<State>,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["getGlobalState"]
		) => State;

		getGlobalStateOrEmpty: <State>(
			fullQualifiedName: string, // full qualified child path
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["getGlobalStateOrEmpty"]
		) => State | undefined;

		setGlobalState: <State>(
			fullQualifiedName: string, // full qualified child path
			state: ValueOrCallbackWithArgs<State | undefined, State>,
			options: SetStateOptions<State>,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["setGlobalState"]
		) => State;

		initGlobalState: <State>(
			fullQualifiedName: string, // full qualified child path
			state: ValueOrCallback<State>,
			options: Omit<SetStateOptions<State>, "customMerge">,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["initGlobalState"]
		) => State;

		removeGlobalState: (
			fullQualifiedNames: string | string[], // full qualified child path
			options: RemoveStateOptions,
			globalStateRoot: GlobalStateRoot<unknown>,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["removeGlobalState"]
		) => void;
	};
}
