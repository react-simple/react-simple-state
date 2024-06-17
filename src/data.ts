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

	DEFAULTS: {
		changeFilters: {
			always: {
				thisState: "always",
				parentState: "always",
				childState: "always"
			},

			never: {
				thisState: "never",
				parentState: "never",
				childState: "never"
			},

			// subscribe to changes of this member and any parent members in the global state tree by default
			defaultSubscribeFilters: {
				thisState: "always",
				parentState: "always",
				childState: "never"
			},
			// update components subscribed to this state and any child states in the global state tree by default
			defaultUpdateFilters: {
				thisState: "always",
				parentState: "never",
				childState: "always"
			}
		}
	}

};
