# React Simple! State Library
Basic global/context level state management hooks/components for React application development.
Uses **styled-components** and **storybook** to review the components.

The primary **useGlobalState()** hook works like the React **useState()** hook except that the **state is stored globally** and can be shared between components.
The **stateKey** argument is used to separate state entries and to update components subscribed to a particular key only when the state changes.
Components can also further control which state changes should update the caller component and which not by specifying the **getUpdates** argument
; *true* for all updates with the same *stateKey*, *false* for no updates at all and a callback function to inspect the old and new states to decide.

The **useContextState()** hook can be used to access context-level state. By default the **root-context** is used, which is global, but using the
**&lt;StateContext&gt;** component it is possible to define child contexts in the DOM. This is achieved by storing *contextId* in **React.context** and using
that *contextId* and *stateKey* to access separate state entries based on the DOM location of the caller component.

There are additional hooks to access the root state or multiple entries at once in a batch (by specifying contextId/statekey arrays).
See Storybook examples for details on usage.

# Usage

## Installation
npm -i @react-simple/react-simple-state

## Build
npm run build

## Run Storybook
npm run storybook

## Import
import { ... } from "@react-simple/react-simple-state";

# Configuration
## REACT_SIMPLE_STATE

Members in the REACT_SIMPLE_STATE object can be set to update the behavior of the provided functions.

- **ROOT_CONTEXT_ID**: The default *contextId* for the **root-context** in STATE_CONTEXT_ROOT which is used when no &lt;StackContext&gt; is found in the DOM.
'ROOT_CONTEXT' by default.

# Content

## Types
- **StateChangeArgs&lt;State&gt;**: Parameter type used in callbacks related to state changes (*stateKey*, *oldState*, *newState*)
- **StateChangeSubscriptions&lt;StateChangeArgs&gt;**: Subscription records for state entries used internally to notify/update subscribed components on state change
- **StateEntry&lt;State, StateChangeArgs&gt;**: State entry used in global-state and context-state containing the state and the list of subscribed components
to get notified/updated on state changes.

## Global State

Global state works like React component state	except that the state is stored globally and can be shared between components.
The **stateKey** argument is used to separate state entries and to update components subscribed to a particular key only when the state changes.

### Types

- **GlobalState**: The root global-state. By using the **useGlobalStateRoot()** hook it is possible to subscribe to state changes at the root level
which means that the subscribed component will get notified/updated on any global-state changes.

### Functions

- **getGlobalStateRoot**: *This method is usually used internally.* Returns the global-state root object (GlobalState type) which can be read and modified,
however, it is not advised to do so, only for development/testing purposes.

- **getGlobalStateEntry&lt;State&gt;**: *This method is usually used internally.* Returns a global-state entry by *stateKey* as-it-is.
Can be uninitialized and undefined. It contains the list of *subscribers*.

- **getOrCreateGlobalStateEntry&lt;State&gt;**: *This method is usually used internally.* Returns a global-state entry by *stateKey* after initialization,
if needed. Also registers the entry in the global-state. It contains the list of *subscribers*.

- **getGlobalState&lt;State&gt;**: Returns state value from global-state by *stateKey*. It always returns the current state or the default state.
This function can be used in event handlers or in components which do not need to be updated on state changes therefore using
the **useGlobalState()** hook would be unnecessary.

- **setGlobalState&lt;State&gt;**: Sets the state entry in global-state by *stateKey* and will notify/update all subscribed components.
This function can be used in event handlers or in components which do not need to be updated on state changes therefore using
the **useGlobalState()** hook would be unnecessary. The argument can be a partial state - or a callback function returning it -,
which then will be merged with the current state; undefined and null members will be skipped.  (Custom merge callback function can be specified.)

- **initGlobalState&lt;State&gt;**: Initializes the state entry in global-state by *stateKey* and will notify/update all subscribed components.
This function can be used in event handlers or in components which do not need to be updated on state changes therefore using
the **useGlobalState()** hook would be unnecessary. The argument must be a complete state object, undefined and null members will be set in state.
This function is to be called from component initializers.

- **removeGlobalState**: Removes state entries with the specified *stateKey(s)* from the global-state. **Does not** notify/update the subscribed components.
This function is to be called from component finalizers.

### Hooks

- **useGlobalState&lt;State&gt;**: Returns [*state*, *setState()*] value from global-state by *stateKey*.
	- Always returns the current state or the default state.
	- Subscribes to state changes so when global-state with the same *stateKey* gets updated the parent component will get updated too as long as
*getUpdates* is *true* or returns *true*.
		- *getUpdates* is either *true* to react to all updates, *false* to react to no updates or a *callback function*
to return *true* or *false* based on the passed *oldState* and *newState* values. For example, it can react to the change of a particular member only by
returning *oldState*[*memberName*] !== *newState*[*memberName*].
	- The hook returns a *setState* function to update the requested state.
		- This function is the simplified version of *setGlobalState()*, since it does not require those arguments which were already specified for the hook (*stateKey*, *defaultValue* etc.).
		- Custom merge callback function can be specified for the hook and for the set state call too.

- **useGlobalStateBatch**: Similar to the useGlobalState() hook, but it accepts multiple state keys and returns states in an associative array
with *stateKey* keys. Subscribes to all state changes for those state keys. State is always returned as-it-is, there is no initialization with a default value.
It returns the *setGlobalState()* function to set any state.

- **useGlobalStateRoot**: This hook returns the root global-state with all state keys included and subscribes to any global-state changes.
State is always returned as-it-is, there is no initialization with a default value. It returns the *setGlobalState()* function to set any state.

## Context State

Context-state can be used to access context-level state. By default the **root-context** is used, which is global, but using the
**&lt;StateContext&gt;** component it is possible to define child contexts in the DOM. This is achieved by storing *contextId* in React.context and using
that *contextId* and *stateKey* to access separate state entries based on the DOM location of the caller component.

### Types

- **StateContextData**: Data type for the **&lt;StateContext&gt;** component to define the state contexts in the DOM.
It only contains the *contextId*, the actual data is stored in GLOBAL_CONTEXT_STATE.
 
- **ContextStateChangeArgs&lt;State&gt;**: Parameter type used in callbacks related to context-state changes (contextId, stateKey, oldState, newState)
- **ContextStateEntry&lt;State&gt;**: State entry used in context-state containing the state and the list of subscribed components
to get notified/updated on state change.

- **ContextState**: State for a context which is either the root-context or a child context with *contextId* defined by
**&lt;StateContext&gt;** component instances. It also contains subscriptions because it's possible to subscribe to context-state changes
at the context level which means that the subscribed component will get notified/updated on any context-state changes for that context.

- **ContextGlobalState**: The root context-state. By using the **useContextStateRoot()** hook it is possible to subscribe to state changes at the root level
which means that the subscribed component will get notified/updated on any context-state changes.

### Functions

- **getGlobalContextStateRoot**: *This method is usually used internally.* Returns the context-state root object (ContextGlobalState type)
which can be read and modified, however, it is not advised, only for development/testing purposes.

- **getGlobalContextEntry**: *This method is usually used internally.* Returns a context-state entry by *contextId* as-it-is.
Can be uninitialized and undefined. It contains the list of *subscribers* and the list of *state entries* by *stateKey* underneath the context.

- **getOrCreateGlobalContextEntry**: *This method is usually used internally.* Returns a context-state entry by *contextId* after initialization, if needed.
Also registers the entry in the context-state. It contains the list of *subscribers* and the list of *state entries* by *stateKey* underneath the context.

- **getGlobalContextEntry&lt;State&gt;**: *This method is usually used internally.* Returns a context-state entry by *contextId* and *stateKey* as-it-is.
Can be uninitialized and undefined. It contains the list of *subscribers* too.

- **getOrCreateGlobalContextStateEntry&lt;State&gt;**: *This method is usually used internally.* Returns a context-state entry by *contextId* and *stateKey*
after initialization, if needed. Also registers the entry in the global-state. It contains the list of *subscribers* too.

- **getGlobalContextState&lt;State&gt;**: Returns state value from context-state by *contextId* and *stateKey*. It always returns the current state or
the default state. This function can be used in event handlers or in components which do not need to be updated on state changes therefore
using the **useContextState()** hook would be unnecessary.

- **setGlobalContextState&lt;State&gt;**: Sets the state entry in context-state by *contextId* and *stateKey* and will notify/update all subscribed components.
This function can be used in event handlers or in components which do not need to be updated on state changes therefore using
the **useGlobalState()** hook would be unnecessary. The argument can be a partial state - or a callback function returning it -,
which then will be merged with the current state; undefined and null members will be skipped. (Custom merge callback function can be specified.)

- **initGlobalContextState&lt;State&gt;**: Initializes the state entry in context-state by *contextId* and *stateKey* and will notify/update all
subscribed components. This function can be used in event handlers or in components which do not need to be updated on state changes therefore
using the **useContextState()** hook would be unnecessary. The argument must be a complete state object, undefined and null members will be set in state.
This function is to be called from component initializers.

- **removeGlobalContextState**: Removes state entries with the specified *clientId(s)* and optional *stateKey(s)* from the context-state.
**Does not** notify/update the subscribed components. This function is to be called from component finalizers.

### Hooks

- **useContextState&lt;State&gt;**: Returns [*state*, *setState()*] value from context-state by *contextId* and *stateKey*.
*contextId* is optional and if is not specified the it is automatically picked up from the closest &lt;SectionContext&gt; in DOM hierarchy.
(The parent context in which the current component is placed.) If there is no such context then root-context is used.
	- Always returns the current state or the default state.
	- Subscribes to state changes so when context-state with the same *contextId* and *stateKey* gets updated the parent component will get updated too as long as
*getUpdates* is *true* or returns *true*.
		- *getUpdates* is either *true* to react to all updates, *false* to react to no updates or a *callback function*
to return *true* or *false* based on the passed *oldState* and *newState* values. For example, it can react to the change of a particular member only by
returning *oldState*[*memberName*] !== *newState*[*memberName*].
	- The hook returns a *setState* function to update the requested state.
		- This function is the simplified version of *setGlobalContextState()*, since it does not require those arguments which were already specified for the hook (*contextId*, *stateKey*, *defaultValue* 		etc.).
		- Custom merge callback function can be specified for the hook and for the set state call too.

- **useContextStateBatch**: Similar to the useContextState() hook, but it accepts multiple context ids and state keys and returns states in an associative array
with *contextId* and *stateKey* keys. Subscribes to all state changes for those state keys. State is always returned as-it-is, there is no initialization
with a default value. It returns the *setGlobalContextState()* function to set any state.

- **useContextStateRoot**: This hook returns the root context-state with all context ids and state keys withing contexts included and subscribes to
any global-state changes. State is always returned as-it-is, there is no initialization with a default value.
It returns the *setGlobalContextState()* function to set any state.
