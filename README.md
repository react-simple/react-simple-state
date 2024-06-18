# React Simple! State Library
This library provides React global and context level state management hooks. This documentation is for version **0.7.0**.

Global state works like React component state	except that the state is stored globally and can be shared between components. 
- **Global state is represented by a single hierarchial JavaScript object** and components can subscribe to changes by specifying the ***fullQualifiedName*** of the state node in the shared global state object. 
- By default subscribed components are updated if the subscribed state node or any of its parent or child state nodes get changed, but this update logic can be customized in many ways.
- Updating subscribed components in the state tree can be controlled by using
	- **filters**: thisState, parentState, childState (by default all are **true**)
	- **callback functions** to decide dynamically by comparing old vs new states
	- **selectors** to compare old vs new values
- Update filters can be specified during subscription in the **useGlobalState()** hook for example or during state updates by calling **setState()** returned by the **useGlobalState()** hook or using plain functions like **setGlobalState()** or **initGlobalState()**.
- Everything can be manually trigged so calling directly the **globalStateUpdateSubscribedComponents()** function is the shortest way to update subscribed components.
- Root state and subscriptions are stored in **REACT_SIMPLE_STATE.ROOT_STATE** and can be easily replaced.
- All functions can be injected by setting a custom implementation in **REACT_SIMPLE_STATE.ID**.
- Hooks don't contain any logic, all features are implemented in plain JavaScript functions. Hooks are just wrappers using their internal state to update their parent components and can access React contexts which features are not available for plain functions.
- See **Storybook stories** and **unit tests** for examples.

# Usage

## Installation
npm -i @react-simple/react-simple-state

## Build
npm run build

## Run Storybook
npm run storybook

## Import
import { ... } from "@react-simple/react-simple-state";

# Content

**Global state** works like React component state	except that the state is stored globally and can be shared between components. **Global state is represented by a single hierarchial JavaScript object shared between all components** and components can subscribe to changes by specifying the ***fullQualifiedName*** of the state node in the shared global state object.

**Updating the subscribed components is highly customizable.** By default any state changes for the subscribed state node or any of its parent or child nodes will update the subscribed component, however, this default behavior can be altered in many ways.

Examples:
- If the component is using **useGlobalState("partner.addresses[0]")** with no special ***subscribedStates*** values overriding the default update logic then any state updates to **partner, partner.addresses[0]** or **partner.addresses[0].city** will update the component.
- Components can ignore parent or child state updates or can specify a **condition** callback function to inspect the old and new states for **dynamic selective updates**.
- Components can also specify a **selector** in the **useGlobalStateSelector()** hook in which case updates are automatically filtered by comparing the previous and the current values of the selector.
	- ***fullQualifiedName*** can be used to select the base state object: **"partner"**
	- The ***getValue()*** selector can be used to return the inspected value: **t => t.addresses[0]**
	- The component will only be updated if **partner.addresses[0]** gets updated and changed; or if any of its parents or children get updated by default (**partner**, **partner.addresses** or **partner.addresses[0].city**), if not specified otherwise.
	- The **useGlobalStateSelector()** will return the value, not the state.
	- (The **useGlobalState()** hook provides more flexibility since the returned state and the inspected state for filtering updates are decoupled.)

Global state is stored in **REACT_SIMPLE_STATE.ROOT_STATE** and subscriptions are stored in **REACT_SIMPLE_STATE.ROOT_STATE.subscriptions**. Subscriptions follow the hierarchical structure of the state JavaScript object and built from **GlobalStateSubscriptionEntry** objects containing **subscriptions** (at that level) and **children** (child entries).

The implementation is highly customizable with the following options:
- **Functional programming**: Any **state management logic is accessible in plain functions** not only in hooks. The hooks just instrument these methods within components. Getting, setting, initializing state values or dealing with subscriptions directly without using hooks is possible. See unit tests for examples.
- **Accessible state**: The **REACT_SIMPLE_STATE.ROOT_STATE** member is easily replacable.
- **Injectable root state**: Any state management functions and hooks accept an optional ***globalStateRoot*** parameter to override using the default **REACT_SIMPLE_STATE.ROOT_STATE** member for lifetime of that call/hook.
- **Injectable methods**: All functions are injectable with custom implementations in **REACT_SIMPLE_STATE.DI**.

# Configuration
## REACT_SIMPLE_STATE

Members in the **REACT_SIMPLE_STATE** object can be set to update the behavior of the provided functions.

### REACT_SIMPLE_STATE.LOGGING

- **logLevel**: The current level of logging, can be set to **error, warning, debug, info** or **trace** to filter log messages. Used for all logging in this package. 
- By default logging is directed to the developer console, but it can be replaced by injecting a custom implementation into **REACT_SIMPLE_UTIL.DI.logging.logMessage()**.

### REACT_SIMPLE_STATE.ROOT_STATE

The root global state and subscriptions. By default it is used by all state functions and hooks, but 
- It can be replaced with another object anytime.
- All functions and hooks accept an optional ***globalStateRoot*** parameter to override the usage of this default instance.

### REACT_SIMPLE_STATE.DEFAULTS

- **immutableSetState**: By default any **setGlobalState()** or **initGlobalState()** calls will deep-clone the set state object, but the default value for this behavior can specified here. All methods accept an ***options.immutableSetState*** parameter to overide the usage of this default value.

### REACT_SIMPLE_STATE.CONTEXTS

- **GlobalStateContextData**: 
	- **&lt;StateContext&gt;** components can be used to define ***fullQualifiedNamePrefixes*** for global state hooks.
	- All current contexts can be accessed in **REACT_SIMPLE_STATE.CONTEXTS**.

### REACT_SIMPLE_STATE.DI

Dependency injection references which will be called by the appropriate methods.

For example the **getGlobalState()** function will call the **REACT_SIMPLE_STATE.DI.globalState.getGlobalState()** function, so it can be easily replaced with a custom implementation. 
The custom callback will be called with all parameters and the default implementation - **getGlobalState_default()** -, which makes wrapping the default behavior easier.

# Content

## Types

- **GlobalStateRoot&lt;State&gt;**: 
	- This is the type for the root global state. In contains the **state** (plain JavaScript object) and the **subscriptions**. 
	- Stored in **REACT_SIMPLE_STATE.ROOT_STATE** and can be easily replaced. 
	- All functions and hooks accept it in the optional ***globalStateRoot*** parameter to override the usage of the default ROOT_STATE.
- **StateSetter&lt;State&gt;**: 
	- Callback type returned by state hooks to set the state.
	- It accepts a partial state object or a function getting the current state and returning the new partial state.
- **StateMerger&lt;State&gt;**:
	- Custom merge function to override the default merge logic when setting state.
	- By default a shallow merge is performed over the root members of the newly set state object by using { ...*oldState*, ...*newState* }, but it can be overriden in hook properties or in the **setState()** call.
- **StateReturn&lt;State, StateSetter?&gt;**: State value and state setter returned by hooks.
- **InitStateOptions&lt;State&gt;**: Options for **initGlobalState()** calls:
	- **updateStates**: Filter to control *subscriptions of which states* should be triggered: ***thisState, parentState, childState, condition*()** callback.
		- When a subscription is triggered the subscribed component should be updated, however, the subscribed component may have a ***subscribedState*** filter which might prevent the update.
		- Optional. By default subscriptions of all parent and child states will be triggered, including the updated state.
- **SetStateOptions&lt;State&gt;**: Options for **setGlobalState()** calls:
	- **updateStates**: Same as for InitStateOptions
	- **mergeState()**: Custom merge callback (optional)
- **RemoveStateOptions&lt;State&gt;**: Options for **removeGlobalState()** calls:
	- **removeEmptyParents**: If set all parent objects will be removed which have become empty.

### Subscriptions

- **GlobalStateChangeArgs&lt;State&gt;**:
	- For evaluating whether a particular subscription/component should be updated or not in the tree the current change set is passed to the ***condition*** callback function which includes: ***fullQualifiedName, oldState, newState***, where ***fullQualifiedName*** is the location of the change and not the subscription under evaluation.
- **GlobalStateUpdateConditions&lt;State&gt;**:
	- Set of update conditions to evaluate whether a particular subscription/component should be updated or not depending on the relation of the subscription and the updated state node.
		- **thisState**: Trigger the subscription when this state node was set (default is **true**)
		- **parentState**: Trigger the subscription when a parent state node of this state node was set (default is **true**)
		- **childState**: Trigger the subscription when a child state node of this state node was set (default is **true**)
		- **condition(*changeArgs*)**: Callback function to dynamically evaluate.
- **GlobalStateSubscription&lt;State&gt;**:
	- Components can subscribe to state node changes.
	- This type represents a subscription with the following members:
		- **fullQualifiedName** of the state node
		- **subscribedState** to filter the changes by specifying **GlobalStateUpdateConditions**. All **true** by default, so any parent/child/this state node updates will trigger the subscription and update the component by calling **onUpdate()**.
		- **onUpdate()** callback to update the subscribed component.
		- **onUpdateSkipped()** callback to notify the subscribed component that it should have been updated according to the intentions of the **set/initGlobalState()** call, but it was filtered out by **subscribedState** conditions. So there was an update affecting this component subscription but the component was not subscribed to it intentionally.
- **GlobalStateSubscriptionsEntry&lt;State&gt;**:
	- Subscriptions are ordered in a hierarchical tree following the structure of the global state (which is a plain JavaScript object) and this type represents an entry in this subscription hierarchy. It contains **subscriptions** (at this leveL) and **children** (child entries).

### Global state context

- **GlobalStateContextData**: **&lt;StateContext&gt;** components can be used to define ***fullQualifiedNamePrefixes*** for global state hooks and this type represents context data including: **contextId, uniqueId** (of the context), **fullQualifiedNamePrefix** and **parentContexts**.
- The closest context in the DOM can be accessed by using **useGlobalStateContext()**.
- All current contexts can be accessed in **REACT_SIMPLE_STATE.CONTEXTS**.

## Functions

State can be read and written by using plain functions instead of hooks too. However, unlike hooks, functions don't provide subscription mechanisms therefore caller components can't get notified/updated about state changes. Albeit, using functions in event handlers is perfectly safe since when the event is fired the actual state will be read anyway.

- **getGlobalState&lt;State&gt;(*fullQualifiedName, defaultState, options*)**:
	- Returns the current state value from global state by using ***fullQualifiedName***.
	- Always returns the current state or the default state, but not empty.
	- Can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.

- **getGlobalStateOrEmpty&lt;State&gt;(*fullQualifiedName, options*)**:
	- Returns the current state value from global state by using ***fullQualifiedName***.
	- Returns the current state or empty; no defaultState parameter.
	- Can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.

- **setGlobalState&lt;State&gt;(*fullQualifiedName, state, defaultState, options*)**:
	- Sets the state value in global state by using ***fullQualifiedName*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.
	- The argument can be a partial state or a callback function returning it, which then will be merged with the current state; *undefined* and *null* members will be skipped.
	- The merging of the new state with the current state is a *shallow* merge, but a custom **mergeState()** callback can be provided in ***options***.

- **initGlobalState&lt;State&gt;(*fullQualifiedName, state, options*)**: 
	- Initializes the state value in global state by using ***fullQualifiedName*** and will update all subscribed components.
	- This function can be used in event handlers or in components which do not need to be updated on state changes therefore using the **useGlobalState()** hook would just generate unnecessary updates.
	- The argument must be a complete state object since no merging will occur, *undefined* and *null* members will be set in the state.
	- This function is to be called from **component initializers**.

- **removeGlobalState(*fullQualifiedNames, options*)**:
	- Removes state objects from the global state.
	- **Does not** update the subscribed components.
	- This function is to be called from **component finalizers**.
	- ***removeEmptyParents*** can be specified in ***options*** to clean-up parents by removing any empty parents.

## Hooks

- **useGlobalState&lt;State&gt;({ *fullQualifiedName, subscribedStates, defaultState, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?* })**: 
	- Returns **[*state*, *setState()*]** result from global state by using ***fullQualifiedName***.
	- Always returns the current state or the default state, but not empty.
	- Subscribes to state changes so when global state with the same ***fullQualifiedName*** or if any parent or child state get updated.
	- Ignoring state changes can be specified in ***subscribedStates*** by setting ***thisState, parentState*** or ***childState*** to **false** and a callback function (***condition***) can be provided to compare ***oldState*** vs ***newState*** for dynamically evaluated updates.
	- By default ***fullQualifiedName*** is prefixed with any name prefixes coming from **&lt;StateContext&gt;** React contexts, but it can be disabled by setting ***ignoreContexts*** to **false**.
	- By default the closest React context is used but a concrete one can be specified by passing its ***contextId***.
	- if ***globalStateRoot*** is set it will be used instead of the default global state root in **REACT_SIMPLE_STATE.ROOT_STATE** for all state and subscription operations.
	- This hook returns a **setState()** function to update the requested state.
		- **setState(*state, options*)** is the simplified version of **setGlobalState({ *fullQualifiedName, state, defaultState, options* })**, since it does not require those arguments which were already specified for the hook.
		- The merging of the new state with the current state is a *shallow* merge, but a custom merge method can be specified either in ***options*** for the **setState()** call or in the properties of the hook.

- **useGlobalStateBatch({ *fullQualifiedNames, subscribedStates, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?* })**: 
	- Similar to the **useGlobalState()** hook, but it accepts multiple state paths and returns states in an associative array.
	- Subscribes to all state changes for all state paths.
	- State is always returned as-it-is, there is no initialization with a default value and **undefined** can be returned.
	- It returns the global **setGlobalState()** function to set any states.

- **useGlobalStateSelector({ *fullQualifiedName, defaultState, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?, getValue?, setValue?, objectCompareOptions? * })**: 
	- Similar to the **useGlobalState()** hook, but a ***getValue()*** selector must be specified to return a particular member value from the state addressed by ***fullQualifiedName***.
	- Conditionally filtering updates (***subscribedStates.condition***) is automatically implemented by comparing the value returned by the selector against its previous value, therefore it cannot be specified manually. Value comparison is done by calling **sameObjects(*obj1, obj2, objectCompareOptions*)** from the "react-simple-util" package to perform a deep object comparison.
	- The ***setValue()*** callback must also be provided for updating the value returned by the ***getValue()*** selector.
	
- **useGlobalStateReadOnlySelector({ *fullQualifiedName, defaultState, subscriberId?, mergeState?, ignoreContexts?, contextId?, enabled?, globalStateRoot?, onUpdate?, onUpdateSkipped?, getValue?, objectCompareOptions? * })**: 
	- The read-only version of the **useGlobalStateSelector()** hook which does not need the ***setValue()*** callback.

## Context State

Context state is implemented by using React contexts. The **&lt;StateContext&gt;** component can be placed in the DOM to specify a ***fullQualifiedNamePrefix*** for all child components.
- The **useGlobalState()** hook and other hooks will automatically consider the state path prefix coming from the closest context.
- Contexts can be embedded into each other.
- Hooks ignore state contexts if ***props.ignoreContexts*** is set.
- Hooks use a concrete context instead of the closest context if **props.*contextId*** is set.
- The closest context in the DOM is accessed by using **useGlobalStateContext()**.
- All current contexts can be accessed in **REACT_SIMPLE_STATE.CONTEXTS**.


# Links #

- How to Set Up Rollup to Run React?: https://www.codeguage.com/blog/setup-rollup-for-react
- Storybook with absolute paths: https://stackoverflow.com/questions/51771077/storybook-with-absolute-paths
- Storybook Canvas: 'ReferenceError: react is not defined': https://stackoverflow.com/questions/74995855/storybook-canvas-referenceerror-react-is-not-defined
