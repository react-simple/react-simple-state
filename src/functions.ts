import { deepCopyObject } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { ROOT_STATE_DEFAULT } from "data.internal";

// Clears any global state settings and subscriptions. Only resets ROOT_STATE, but not LOGGING, DI etc.
export const resetGlobalState = () => {
	REACT_SIMPLE_STATE.ROOT_STATE = deepCopyObject(ROOT_STATE_DEFAULT)
};
