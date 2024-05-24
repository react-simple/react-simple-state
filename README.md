# React Simple! State Library
React global and context level state management hooks. The **useGlobalState()** and **useContextState()** hooks work like the default **useState()** hook except that their scope is non-local.

Features:
- The primary **useGlobalState()** hook works like the React **useState()** hook except that the **state is stored globally** and can be shared between components.
	- The ***stateKey*** argument is used to separate state entries and to update components only subscribed to a particular state key when state changes.
	- Components can further **filter state changes** they react to by specifying the **getUpdates** argument:
		- *true* for all updates with the same *stateKey*
		- *false* for no updates at all and
		- a callback function with (*newState, oldState, setStateArgs*) arguments to dynamiclly decide if the component should be updated or not
- The **useContextState()** hook can be used to access context-level state in the DOM.
	- By default **root-context** is used, which is global, but with  the **&lt;StateContext&gt;** component child contexts can be created in the DOM.
	- This is achieved by storing **contextId**-s in **React.context**-s and using those context ids to access separate state entries based on the DOM location of the caller component.
	- Example: define sections in a form where all inputs can access their current section with section state
- Additional hooks are available to access the root state directly or multiple state entries at once in a batch by specifying *contextId/statekey* arrays. All these hooks support subscription therefore caller components can subscribe to root state changes, multiple state keys or context ids at once.
- **Dependency injection** for pluggable architecture. All the important methods can be replaced with custom implementation by setting REACT_SIMPLE_STATE.DI members.
- See **Storybook examples** for details

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

- **ROOT_CONTEXT_ID**: The default *contextId* for the **root-context** in STATE_CONTEXT_ROOT which is used when no &lt;StackContext&gt; component is found in the DOM. "ROOT_CONTEXT" by default and cannot be changed.

# Content

## Types
- **StateChangeArgs&lt;State&gt;**: Parameter type used in callbacks related to state changes with (*stateKey*, *oldState*, *newState*)
- **StateChangeSubscriptions&lt;StateChangeArgs&gt;**: Subscription records for state entries used internally to notify/update subscribed components on state changes
- **StateEntry&lt;State, StateChangeArgs&gt;**: State entry used in global-state and context-state containing the state and the list of subscribed components
to get updated on state changes.
- **StateSetter&lt;*State*&gt;**: State setter callback for state management functions or hooks. Partial state can be set with a direct value or with the usage of a callback function.
- **StateReturn&lt;*State*&gt;**: Return type for state management hooks ([*State*, *StateSetter*])


## Global State

Global state works like React component state	except that the state is stored globally and can be shared between components.
The **stateKey** argument is used to separate state entries and to update components subscribed only to a particular key when state changes.

### Types

- **GlobalState**: The root global-state. By using the **useGlobalStateRoot()** hook it is possible to subscribe to state changes at the root level
which means that the subscribed component will get updated on any global-state changes.

### Functions

State can be read and written using functions instead of hooks. However, unlike hooks, functions won't provide subscription therefore calling components won't 
get updated when state changes so the DOM cannot react. However, using these functions in event handlers (like *onClick*) is perfectly safe since when 
the event is fired the actual state will be read.

- **getGlobalStateRoot()**:
	- Returns the global-state root object (**GlobalState** type) which can be read and modified, however, it is not advised to do so, only for development and testing purposes.
	- Does not subscribe to state changes as neither of the functions do.

- **getGlobalState&lt;State&gt;(*stateKey, defaultValue*)**:
	- Returns state value from global-state by ***stateKey***.
	- It always returns the current state or the default state.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would  just generate unnecessary updates.

- **setGlobalState&lt;State&gt;(*stateKey, state, defaultValue, customMerge*)**:
	- Sets the state entry in global-state by ***stateKey*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.
	- The argument can be a partial state or a callback function returning it, which then will be merged with the current state; *undefined* and *null* members will be skipped.
	- The merging of the new state with the current state is a *shallow* merge, but a **customMerge()** callback can be provided.

- **initGlobalState&lt;State&gt;(*stateKey, state*)**: 
	- Initializes the state entry in global-state by ***stateKey*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.
	- The argument must be a complete state object since no merging will happen, *undefined* and *null* members will be set in state.
	- This function is to be called from **component initializers**.

- **removeGlobalState(*stateKeys*)**:
	- Removes state entries with the specified ***stateKeys*** from the global-state.
	- **Does not** update the subscribed components.
	- This function is to be called from **component finalizers**.

#### Internal functions

Internal functions are not exported by the package.

- **getGlobalStateEntry&lt;State&gt;(*stateKey*)**:
	- Returns a global-state entry by ***stateKey*** as-it-is.
	- Can be uninitialized and *undefined*.
	- Contains the list of *subscribers*.

- **getOrCreateGlobalStateEntry&lt;State&gt;(*stateKey, state*)**:
	- Returns a global-state entry by ***stateKey*** after initialization if needed.
	- Also registers the entry in the global-state if it was not present.
	- Contains the list of *subscribers*.

### Hooks

- **useGlobalState&lt;State&gt;({ *stateKey, getUpdates, defaultValue, subscriberId?, merge?* })**: 
	- Returns [*state*, *setState()*] result from global-state by ***stateKey***.
	- Always returns the current state or the default state.
	- Subscribes to state changes so when global-state with the same ***stateKey*** it will get updated.
	- The parent component will get updated as long as the **getUpdates** argument is *true* or does return *true*.
	- ***getUpdates*** is either:
		- *true* to react to all updates
		- *false* to react to no updates or
		- a *callback function* to return *true* or *false* based on the passed (*oldState, newState, setStateArgs*) arguments. 
		- Example: it can react to the change of a particular member only by returning *oldState*[*memberName*] !== *newState*[*memberName*].
	- This hook returns a **setState(*state, customMerge*)** function to update the requested state.
		- **setState()** is the simplified version of **setGlobalState()**, since it does not require those arguments which were already specified for the hook: *stateKey, defaultValue* etc.
		- The merging of the new state with the current state is a *shallow* merge, but a custom merge method can be specified either for the **setState()** call or for the hook.

- **useGlobalStateBatch({ *stateKeys, getUpdates, subscriberId?* })**:
	- Similar to the **useGlobalState()** hook, but it accepts multiple state keys and returns states in an associative array with **stateKey** keys.
	- Subscribes to all state changes for those state keys.
	- State is always returned as-it-is, there is no initialization with a default value.
	- It returns the **setGlobalState()** function to set any state.

- **useGlobalStateRoot({ *getUpdates, subscriberId?* })**:
	- This hook returns the root global-state with all state keys included and subscribes to any global-state changes.
	- State is always returned as-it-is, there is no initialization with a default value.
	- It returns the **setGlobalState()** function to set any state.

## Context State

Context-state can be used to access context-level state. By default the **root-context** is used, which is global, but using the
**&lt;StateContext&gt;** component it is possible to define child contexts in the DOM. This is achieved by storing ***contextId*** in **React.context** and using
that ***contextId*** and ***stateKey*** to access separate state entries based on the DOM location of the caller component.

### Types

- **StateContextData**: Data type for the **&lt;StateContext&gt;** component to define the state contexts in the DOM.
It only contains the ***contextId***, the actual data is stored in GLOBAL_CONTEXT_STATE.
 
- **ContextStateChangeArgs&lt;State&gt;**: Parameter type used in callbacks related to context-state changes: (*contextId, stateKey, oldState, newState*)
- **ContextStateEntry&lt;State&gt;**: State entry used in context-state containing the state and the list of subscribed components
to get updated on state change.

- **ContextState**: State for a context which is either the root-context or a child context with ***contextId*** defined by
**&lt;StateContext&gt;** component instances. It also contains subscriptions because it's possible to subscribe to context-state changes
at the context level which means that the subscribed component will get updated on any context-state changes for that context regardless of ***stateKey***.

- **ContextGlobalState**: The root context-state. By using the **useContextStateRoot()** hook it is possible to subscribe to state changes at the root level
which means that the subscribed component will get updated on any context-state changes regardless of ***contextId*** and ***stateKey***.

### Functions

State can be read and written using functions instead of hooks. However, unlike hooks, functions won't provide subscription therefore calling components won't 
get updated when state changes so the DOM cannot react. However, using these functions in event handlers (like *onClick*) is perfectly safe since when 
the event is fired the actual state will be read.

- **getGlobalContextStateRoot()**:
	- Returns the context-state root object (*ContextGlobalState* type) which can be read and modified, however, it is not advised, only for development and testing purposes.
	- Does not subscribe to state changes as neither of the functions do.

- **getGlobalContextState&lt;State&gt;(*contextId, stateKey, defaultValue*)**:
	- Returns state value from context-state by ***contextId*** and ***stateKey***.
	- It always returns the current state or the default state.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useContextState()** hook would generate unnecessary updates.

- **setGlobalContextState&lt;State&gt;(*contextId, stateKey, state, defaultValue, customMerge*)**:
	- Sets the state entry in context-state by ***contextId*** and ***stateKey*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would generate unnecessary updates.
	- The argument can be a partial state (or a callback function returning it), which then will be merged with the current state; *undefined* and *null* members will be skipped.
	- The merging of the new state with the current state is a *shallow* merge, but a **customMerge()** callback can be provided.

- **initGlobalContextState&lt;State&gt;(*contextId, stateKey, state*)**:
	- Initializes the state entry in context-state by ***contextId*** and ***stateKey*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useContextState()** hook would generate unnecessary updates.
	- The argument must be a complete state object since no marging will happen, *undefined* and *null* members will be set in state.
	- This function is to be called from component initializers.

- **removeGlobalContextState(*contextIds, stateKeys*)**:
	- Removes state entries with the specified ***clientIds*** and optional ***stateKeys*** from the context-state.
	- **Does not** update the subscribed components.
	- This function is to be called from component finalizers.

#### Internal functions

Internal functions are not exported by the package.

- **getGlobalContextEntry(*contextId*)**: 
	- Returns a context-state entry by ***contextId*** as-it-is.
	- Can be uninitialized and undefined. 
	- Contains the list of *subscribers* and the list of *state entries* by state key underneath the context.

- **getOrCreateGlobalContextEntry(*contextId*)**: 
	- Returns a context-state entry by ***contextId*** after initialization, if needed.
	- Also registers the entry in the context-state.
	- It contains the list of *subscribers* and the list of *state entries* by state key underneath the context.

- **getGlobalContextEntry&lt;State&gt;(*contextId, stateKey*)**: 
	- Returns a context-state entry by ***contextId*** and ***stateKey*** as-it-is.
	- Can be uninitialized and undefined.
	- It contains the list of *subscribers* too.

- **getOrCreateGlobalContextStateEntry&lt;State&gt;(*contextId, stateKey*)**:
	- Returns a context-state entry by ***contextId*** and ***stateKey***
after initialization, if needed.
	- Also registers the entry in the global-state.
	- It contains the list of *subscribers* too.

### Hooks

- **useContextState&lt;State&gt;({ *stateKey, getUpdates, defaultValue, contextId?, merge?* })**:
	- Returns [*state*, *setState()*] value from context-state by ***contextId*** and ***stateKey***. 
	- ***contextId*** is optional and if is not specified then it will be automatically picked up from the closest **&lt;SectionContext&gt;** in DOM hierarchy. (The parent context in which the current component is placed.) If there is no such context then root-context is used.
	- Always returns the current state or the default state.
	- Subscribes to state changes so when context-state with the same ***contextId*** and ***stateKey*** gets updated the parent component will get updated too as long as ***getUpdates*** is *true* or returns *true*.
	- ***getUpdates*** is either:
		- *true* to react to all updates
		- *false* to react to no updates or
		- a *callback function* to return *true* or *false* based on the passed (*oldState, newState, setStateArgs*) arguments.
		- Example: it can react to the change of a particular member only by returning *oldState*[*memberName*] !== *newState*[*memberName*].
	- The hook returns a **setState(*value, customMerge*)** function to update the requested state.
		- The **setState()** function is the simplified version of **setGlobalContextState()**, since it does not require those arguments which are already specified for the hook: *contextId*, *stateKey*, *defaultValue* etc.
		- The merging of the new state with the current state is a *shallow* merge, but a custom merge method can be specified either for the **setState()** call or for the hook.

- **useContextStateBatch({ *contextIds, stateKeys?, getUpdates, subscriberId?* })**:
	- Similar to the **useContextState()** hook, but it accepts multiple context ids and state keys and returns states in an associative array with ***contextId*** and ***stateKey*** keys. 
	- Subscribes to all state changes for those state keys. 
	- State is always returned as-it-is, there is no initialization with a default value.
	- It returns the **setGlobalContextState()** function to set any state.

- **useContextStateRoot({ *getUpdates, subscriberId?* })**:
	- This hook returns the root context-state with all context ids and state keys withing contexts included and subscribes to any global-state changes.
	- State is always returned as-it-is, there is no initialization with a default value.
	- It returns the **setGlobalContextState()** function to set any state.

# Links

- How to Set Up Rollup to Run React?: https://www.codeguage.com/blog/setup-rollup-for-react
- Storybook with absolute paths: https://stackoverflow.com/questions/51771077/storybook-with-absolute-paths
- Storybook Canvas: 'ReferenceError: react is not defined': https://stackoverflow.com/questions/74995855/storybook-canvas-referenceerror-react-is-not-defined
