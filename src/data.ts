import { deepCopyObject } from "@react-simple/react-simple-util";
import { ROOT_STATE_DEFAULT } from "data.internal";
import { ReactSimpleState } from "types";

// For depndency injection references. All stub references are set by the respective util files.
const stub: any = () => { };

export const REACT_SIMPLE_STATE: ReactSimpleState = {
	LOGGING: {
		logLevel: "error" // for functions in react-simple-state
	},

	// stubs are replaced by the corresponding functions.ts files
	DI: {
		subscription: {
			getGlobalStateSubscriptionsMemberInfo: stub,
			getGlobalStateSubscriptions: stub,
			subscribeToGlobalState: stub,
			unsubscribeFromGlobalState: stub,
			globalStateUpdateSubscribedComponents: stub,
			evaluateGlobalStateComponentChangeTrigger: stub
		},

		globalState: {
			getGlobalState: stub,
			getGlobalStateOrEmpty: stub,
			setGlobalState: stub,
			initGlobalState: stub,
			removeGlobalState: stub
		}
	},

	ROOT_STATE: deepCopyObject(ROOT_STATE_DEFAULT),
	CONTEXTS: {},

	DEFAULTS: {
		changeFilters: {
			always: {
				thisState: true,
				parentState: true,
				childState: true
			},

			never: {
				thisState: false,
				parentState: false,
				childState: false
			},

			// subscribe to changes of this member and any parent members in the global state tree by default
			defaultSubscribeFilters: {
				thisState: true,
				parentState: true,
				childState: true
			},

			// update components subscribed to this state and any child or parents states in the global state tree by default
			// (in other words, it's always the subscribers how control the update logic, setGlobalState() will trigger all parent/children)
			defaultUpdateFilters: {
				thisState: true,
				parentState: true,
				childState: true
			}
		}
	}

};
