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
			globalStateUpdateSubscribedComponents: stub
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
		immutableSetState: true
	}
};
