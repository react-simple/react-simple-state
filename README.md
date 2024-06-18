# React Simple! State Library
This library provides React global and context level state management hooks. The primary **useGlobalState()** hook works like the React **useState()** hook except that the **state is stored globally** and can be shared between components. This documentation is for version **0.7.0**.

Features:
	- The ***fullQualifiedName*** argument is used to separate state entries and to update components only subscribed to a particular state key when state changes.
	- Components can further **filter state changes** they react to by specifying the **updateFilter** argument:
		- *true* for to get all updates with the same *fullQualifiedName*
		- *false* for to get no updates at all and
		- a callback function with (*newState, oldState, setStateArgs*) arguments to dynamiclly decide if the component should be updated or not when state changes.
- The **useContextState()** hook can be used to access context-level state in the DOM.
	- By default **root-context** is used, which is global, but with  the **&lt;StateContext&gt;** component child contexts can be created in the DOM.
	- This is achieved by storing **contextId**-s in **React.context**-s and using those context ids to access separate state entries based on the DOM location of the caller component.
	- Example: define sections in a form where all inputs can access their current section with section state
- Additional hooks are available to access the root state directly or multiple state entries at once in a batch by specifying *contextId/statekey* arrays. All these hooks support subscription therefore caller components can subscribe to root state changes, multiple state keys or context ids at once.
- **Dependency injection** for pluggable architecture. All the important methods can be replaced with custom implementation by setting REACT_SIMPLE_STATE.DI members.
- See **Storybook examples** for samples for all features

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

### REACT_SIMPLE_STATE.DI

Dependency injection references which will be called by the appropriate methods.

For example the **getGlobalState()** function will call the **REACT_SIMPLE_STATE.DI.globalState.getGlobalState()** function, so it can be easily replaced with a custom implementation. 
The custom callback will be called with all parameters and the default implementation - **getGlobalState_default()** -, which makes wrapping the default behavior easier.

# Content

## Types
- **StateChangeArgs&lt;State&gt;**: Parameter type used in callbacks related to state changes with (*fullQualifiedName*, *oldState*, *newState*)
- **StateChangeSubscriptions&lt;StateChangeArgs&gt;**: Subscription records for state entries used internally to notify/update subscribed components on state changes
- **StateEntry&lt;State, StateChangeArgs&gt;**: State entry used in global-state and context-state containing the state and the list of subscribed components
to get updated on state changes.
- **StateSetter&lt;*State*&gt;**: State setter callback for state management functions or hooks. Partial state can be set with a direct value or with the usage of a callback function.
- **StateReturn&lt;*State*&gt;**: Return type for state management hooks ([*State*, *StateSetter*])


## Global State

Global state works like React component state	except that the state is stored globally and can be shared between components. **Global state is represented by a single hierarchial JavaScript object shared between all components** and components can subscribe to any parts of it by specifying the ***fullQualifiedName*** of the state node in the shared global state object.

**Updating the subscribed components is highly customizable.** By default any state changes for the subscribed state node or any of its parent nodes or child nodes will update the subscribed component. For example:
- If the component is using **useGlobalState("partner.addresses[0]")** with no special ***subscribedStates*** values overriding the default update logic then
- Any state updates to **partner, partner.addresses[0]** or **partner.addresses[0].city** will update the component.
- Components can ignore parent or child state updates or can specify a conditional function to inspect the old and new states for **dynamic updates**.
- Components can also specify a **selector** in the **useGlobalStateSelector()** hook in which case updates are automatically filtered by comparing the previous and the current value of the selector.
	- ***fullQualifiedName*** can be used to select the base state object (**"partner"**) and the ***getValue()*** selector can be used to return the inspected value: **t => t.addresses[0]**
	- The component will only be updated if **partner.addresses[0]** gets updated; or any of its parents or children by default, if not specified otherwise.

Subscriptions are stored in a special object tree starting at **REACT_SIMPLE_STATE.ROOT_STATE.subscriptions**, however, **global state is stored as a simple JavaScript object**, so in the above example the **partner** object will have an **addresses** member and **addresses[0]** will have a **city** member. Global state is stored in **REACT_SIMPLE_STATE.ROOT_STATE.state**.

The implementation is highly customizable with the following possibilites:
- Any **state management logic is accessible in plain functions** not only in hooks. The hooks just instrument these methods within components. Getting, setting, initializing state values or dealing with subscriptions manually is possible. See unit tests for examples.
- The **REACT_SIMPLE_STATE.ROOT_STATE** member is easily replacable.
- Any state management functions and hooks accept an optional ***globalStateRoot*** parameter to override using the default **REACT_SIMPLE_STATE.ROOT_STATE** member.
- All functions are injectable with custom implementations in **REACT_SIMPLE_STATE.DI**.


### Functions

State can be read and written using functions instead of hooks too. However, unlike hooks, functions don't provide subscription mechanisms therefore the caller components won't get updated during state changes. Altough, using functions in event handlers is perfectly safe since when the event is fired always the actual state will be read.

- **getGlobalState&lt;State&gt;(*fullQualifiedName, defaultState*)**:
	- Returns state value from global-state by ***fullQualifiedName***.
	- It always returns the current state or the default state.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.

- **setGlobalState&lt;State&gt;(*fullQualifiedName, state, defaultState, options*)**:
	- Sets the state entry in global-state by ***fullQualifiedName*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.
	- The argument can be a partial state or a callback function returning it, which then will be merged with the current state; *undefined* and *null* members will be skipped.
	- The merging of the new state with the current state is a *shallow* merge, but a custom **mergeState()** callback can be provided.

- **initGlobalState&lt;State&gt;(*fullQualifiedName, state, options*)**: 
	- Initializes the state entry in global-state by ***fullQualifiedName*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.
	- The argument must be a complete state object since no merging will happen, *undefined* and *null* members will be set in state.
	- This function is to be called from **component initializers**.

- **removeGlobalState(*fullQualifiedNames, options*)**:
	- Removes state entries from the global-state.
	- **Does not** update the subscribed components.
	- This function is to be called from **component finalizers**.
	- The ***removeEmptyParents*** option can be specified to clean-up parents by removing any empty parents.

### Hooks

- **useGlobalState&lt;State&gt;({ *fullQualifiedName, subscribedStates, defaultState, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?* })**: 
	- Returns **[*state*, *setState()*]** result from global-state by ***fullQualifiedName***.
	- Always returns the current state or the default state.
	- Subscribes to state changes so when global-state with the same ***fullQualifiedName*** changes it will get updated or if any parent or child state gets updated.
	- Ignoring state changes can be specified in ***subscribedStates*** by setting ***thisState, parentState*** or ***childState*** to **false** and a callback function (***condition***) can be provided to compare ***oldState*** vs ***newState*** for dynamic updates.
	- By default ***fullQualifiedName*** is prefixed with any name prefixes coming from **&lt;StateContext&gt;** React contexts, but it can be disabled by setting ***ignoreContexts*** to **false**. By default the closest React context is used but a concrete one can be specified by setting ***contextId***.
	- if ***globalStateRoot*** is set it will be used instead of the default global-state root in **REACT_SIMPLE_STATE.ROOT_STATE** for all state and subscription operations.
	- This hook returns a **setState()** function to update the requested state.
		- **setState(*state, customMerge*)** is the simplified version of **setGlobalState({ *fullQualifiedName, state, defaultState, customMerge* })**, since it does not require those arguments which were already specified for the hook.
		- The merging of the new state with the current state is a *shallow* merge, but a custom merge method can be specified either for the **setState()** call or for the hook.

- **useGlobalStateBatch({ *fullQualifiedNames, subscribedStates, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?* })**: 
	- Similar to the **useGlobalState()** hook, but it accepts multiple state paths and returns states in an associative array.
	- Subscribes to all state changes for those state paths.
	- State is always returned as-it-is, there is no initialization with a default value.
	- It returns the global **setGlobalState()** function to set any state.

- **useGlobalStateSelector({ *fullQualifiedName, defaultState, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?, getValue?, setValue?, objectCompareOptions? * })**: 
	- Similar to the **useGlobalState()** hook, but a ***getValue()*** selector must be specified to return a particular member from the state addressed by ***fullQualifiedName***.
	- Conditionally filtering updates (***subscribedStates.condition***) is automatically implemented by comparing the value returned by the selector against its previous value (by calling **sameObjects(*obj1, obj2, objectCompareOptions*)** from react-simple-util to perform a deep object comparison).
	- The ***setValue()*** callback must also be provided for updating the value returned by the ***getValue()*** selector.
	
- **useGlobalStateReadOnlySelector({ *fullQualifiedName, defaultState, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?, getValue?, objectCompareOptions? * })**: 
	- The read-only version of the **useGlobalStateSelector()** hook.
	- It does not need the ***getValue()*** callback.

## Context State

Context state is implemented by using React contexts. The **&lt;StateContext&gt;** component can be placed in the DOM to specify a ***fullQualifiedNamePrefix*** for all child components.
- The **useGlobalState()** hook and other hooks will automatically consider the state path prefix coming from the closest context.
- Contexts can be embedded into each other.
- Hooks can ignore the state contexts by specifying ***ignoreContexts***.
- Hooks can use a concrete context instead of the closest context by specifying ***contextId***

# Links #

- How to Set Up Rollup to Run React?: https://www.codeguage.com/blog/setup-rollup-for-react
- Storybook with absolute paths: https://stackoverflow.com/questions/51771077/storybook-with-absolute-paths
- Storybook Canvas: 'ReferenceError: react is not defined': https://stackoverflow.com/questions/74995855/storybook-canvas-referenceerror-react-is-not-defined
