import { GlobalStateRoot } from "types";

// these elements are not exported by the package

export const ROOT_STATE_DEFAULT: GlobalStateRoot<unknown> = {
	state: {},
	subscriptions: {
		fullQualifiedName: "",
		children: {},
		subscriptions: {}
	}
};
