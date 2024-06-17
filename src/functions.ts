import { deepCopyObject } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { ROOT_STATE_DEFAULT } from "data.internal";

// Clears any global state settings and subscriptions. Only resets ROOT_STATE, but not LOGGING, DI etc.
export const resetGlobalState = (
	{
		state = true,
		subscriptions = true,
		contexts = false
	}: {
		state?: boolean;
		subscriptions?: boolean;
		contexts?: boolean;
	} = {}
) => {
	if (state) {
		REACT_SIMPLE_STATE.ROOT_STATE.state = deepCopyObject(ROOT_STATE_DEFAULT.state as object);
	}

	if (subscriptions) {
		REACT_SIMPLE_STATE.ROOT_STATE.subscriptions = deepCopyObject(ROOT_STATE_DEFAULT.subscriptions);
	}

	if (contexts) {
		REACT_SIMPLE_STATE.CONTEXTS = {};
	}
};
