import { ChildMemberInfoWithCallbacks, getChildMemberInfo, splitFullQualifiedName } from "@react-simple/react-simple-mapping";
import { REACT_SIMPLE_STATE } from "data";
import {
  GlobalStateChangeArgs, GlobalStateChangeFilter, GlobalStateChangeFilters, GlobalStateConditionalChangeFilter, GlobalStateSubscription,
  GlobalStateSubscriptionsEntry
} from "./types";
import { Guid, forEachReverse, logTrace, recursiveIteration } from "@react-simple/react-simple-util";
import { GlobalStateRoot, SetStateOptions } from "types";

function getGlobalStateSubscriptionsMemberInfo_default<State>(
  fullQualifiedName: string,
  createEntryIfMissing: boolean, // if set won't return undefined
  globalStateRoot: GlobalStateRoot<unknown>
): ChildMemberInfoWithCallbacks<GlobalStateSubscriptionsEntry<State>> | undefined {
  return getChildMemberInfo<GlobalStateSubscriptionsEntry<State>>(
    globalStateRoot.subscriptions,
    fullQualifiedName,
    !!createEntryIfMissing,
    {
      getMemberValue: (parent, names) => {
        return (parent as GlobalStateSubscriptionsEntry<unknown>).children[names.name];
      },
      setMemberValue: (parent, names, value) => {
        (parent as GlobalStateSubscriptionsEntry<unknown>).children[names.name] = value as GlobalStateSubscriptionsEntry<unknown>;
        return true;
      },
      createMember: (_, names) => ({
        fullQualifiedName: names.fullQualifiedName,
        subscriptions: {},
        children: {}
      })
    }
  );
}

REACT_SIMPLE_STATE.DI.subscription.getGlobalStateSubscriptionsMemberInfo = getGlobalStateSubscriptionsMemberInfo_default;

export function getGlobalStateSubscriptionsMemberInfo<State>(
  fullQualifiedName: string,
  createEntryIfMissing?: boolean, // if set won't return undefined
  globalStateRoot?: GlobalStateRoot<unknown>
): ChildMemberInfoWithCallbacks<GlobalStateSubscriptionsEntry<State>> | undefined {
  return REACT_SIMPLE_STATE.DI.subscription.getGlobalStateSubscriptionsMemberInfo(
    fullQualifiedName,
    !!createEntryIfMissing,    
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    getGlobalStateSubscriptionsMemberInfo_default
  );
}

function getGlobalStateSubscriptions_default<State>(
  fullQualifiedName: string,
  createEntryIfMissing: boolean, // if set won't return undefined
  globalStateRoot: GlobalStateRoot<unknown>
): GlobalStateSubscriptionsEntry<State> | undefined {
  return getGlobalStateSubscriptionsMemberInfo<State>(fullQualifiedName, createEntryIfMissing, globalStateRoot)?.getValue?.();
}

REACT_SIMPLE_STATE.DI.subscription.getGlobalStateSubscriptions = getGlobalStateSubscriptions_default;

export function getGlobalStateSubscriptions<State>(
  fullQualifiedName: string,
  createEntryIfMissing?: boolean, // if set won't return undefined
  globalStateRoot?: GlobalStateRoot<unknown>
): GlobalStateSubscriptionsEntry<State> | undefined {
  return REACT_SIMPLE_STATE.DI.subscription.getGlobalStateSubscriptions<State>(
    fullQualifiedName,
    !!createEntryIfMissing,
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    getGlobalStateSubscriptions_default
  );
}

const subscribeToGlobalState_default = <State>(
  uniqueId: Guid,
  subscription: Omit<GlobalStateSubscription<State>, "subscribedState"> & { subscribedState?: Partial<GlobalStateChangeFilters<State>> },
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const member = getGlobalStateSubscriptionsMemberInfo<State>(subscription.fullQualifiedName, true, globalStateRoot)!;
  const subs = member.getValue();
  const subscribedState = {
    ...REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultSubscribeFilters,
    ...subscription.subscribedState
  };
  
  if (!subs) {
    member.setValue({
      fullQualifiedName: subscription.fullQualifiedName,
      subscriptions: {
        [uniqueId]: {
          ...subscription ,
          subscribedState
        }
      },
      children: {}
    });
  }
  else {
    subs.subscriptions[uniqueId] = {
      ...subscription,
      subscribedState
    }
  }
};

REACT_SIMPLE_STATE.DI.subscription.subscribeToGlobalState = subscribeToGlobalState_default;

export const subscribeToGlobalState = <State>(
  uniqueId: Guid,
  subscription: Omit<GlobalStateSubscription<State>, "subscribedState"> & { subscribedState?: Partial<GlobalStateChangeFilters<State>> },
  globalStateRoot?: GlobalStateRoot<unknown>
) => {
  return REACT_SIMPLE_STATE.DI.subscription.subscribeToGlobalState<State>(
    uniqueId,
    subscription,
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    subscribeToGlobalState_default
  );
};

const unsubscribeFromGlobalState_default = (
  uniqueId: Guid,
  stateFullQualifiedName: string,
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const subs = getGlobalStateSubscriptions(stateFullQualifiedName, false, globalStateRoot);

  if (subs) {
    delete subs.subscriptions[uniqueId];
  }
};

REACT_SIMPLE_STATE.DI.subscription.unsubscribeFromGlobalState = unsubscribeFromGlobalState_default;

export const unsubscribeFromGlobalState = (
  uniqueId: Guid,
  stateFullQualifiedName: string,
  globalStateRoot?: GlobalStateRoot<unknown>
) => {
  return REACT_SIMPLE_STATE.DI.subscription.unsubscribeFromGlobalState(
    uniqueId,
    stateFullQualifiedName,
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    unsubscribeFromGlobalState_default
  );
};

function evaluateGlobalStateComponentChangeTrigger_default<State>(
  trigger: GlobalStateChangeFilter<State>,
  changeArgs: GlobalStateChangeArgs<State>
): boolean {
  if (trigger === "always") {
    return true;
  }
  else if (trigger === "never") {
    return false;
  }
  else if ((trigger as GlobalStateConditionalChangeFilter<State>).condition) {
    return (trigger as GlobalStateConditionalChangeFilter<State>).condition(changeArgs);
  }
  else {
    return false;
  }
}

REACT_SIMPLE_STATE.DI.subscription.evaluateGlobalStateComponentChangeTrigger = evaluateGlobalStateComponentChangeTrigger_default;

export function evaluateGlobalStateComponentChangeTrigger<State>(
  trigger: GlobalStateChangeFilter<State>,
  changeArgs: GlobalStateChangeArgs<State>
): boolean {
  return REACT_SIMPLE_STATE.DI.subscription.evaluateGlobalStateComponentChangeTrigger(
    trigger, changeArgs, evaluateGlobalStateComponentChangeTrigger_default
  );
}

const updateSubscribedGlobalStateComponents_default = <State>(
  changeArgs: GlobalStateChangeArgs<State>,
  options: SetStateOptions<State>,
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const { stateFullQualifiedName } = changeArgs;
  const updateState = {
    ...REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultUpdateFilters,
    ...options?.updateState
  };

  logTrace(log => log(
    `[globalStateUpdateSubscribedComponents] stateFullQualifiedName=${stateFullQualifiedName}`,
    { stateFullQualifiedName, changeArgs, options, updateState }
  ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

  const thisSubs = getGlobalStateSubscriptions<State>(stateFullQualifiedName, false, globalStateRoot);

  // this state
  if (thisSubs && updateState.thisState && evaluateGlobalStateComponentChangeTrigger(updateState.thisState, changeArgs)) {
    logTrace(log => log(
      `[globalStateUpdateSubscribedComponents] updating this state: '${thisSubs.fullQualifiedName}'`,
      { updateState, thisSubs }
    ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

    for (const [uniqueId, thisSub] of Object.entries(thisSubs.subscriptions)) {
      if (thisSub.subscribedState.thisState &&
        evaluateGlobalStateComponentChangeTrigger(thisSub.subscribedState.thisState, changeArgs)
      ) {
        logTrace(log => log(
          `[globalStateUpdateSubscribedComponents] updating subscriberId: ${uniqueId}'`,
          { uniqueId, thisSub }
        ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

        thisSub.onUpdate(changeArgs, thisSub.fullQualifiedName);
      }
      else {
        logTrace(log => log(
          `[globalStateUpdateSubscribedComponents] skipping subscriberId: ${uniqueId}'`,
          { uniqueId, thisSub }
        ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);
      }
    }
  }

  // parents
  if (updateState.parentState && evaluateGlobalStateComponentChangeTrigger(updateState.parentState, changeArgs)) {
    const fullQualifiedNameParts = splitFullQualifiedName(stateFullQualifiedName);
    const parentSubsPerLevel: GlobalStateSubscriptionsEntry<unknown>[] = []; // paths to all parents
    let node = globalStateRoot.subscriptions;
    
    for (const part of fullQualifiedNameParts) {
      parentSubsPerLevel.push(node);
      node = node.children[part];

      if (!node) {
        break;
      }
    }

    forEachReverse(parentSubsPerLevel, parentSubs => {
      logTrace(log => log(
        `[globalStateUpdateSubscribedComponents] updating parent state: '${parentSubs.fullQualifiedName}'`,
        { updateState, parentSubs }
      ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

      for (const [uniqueId, parentSub] of Object.entries(parentSubs.subscriptions)) {
        if (parentSub.subscribedState.childState &&
          evaluateGlobalStateComponentChangeTrigger(parentSub.subscribedState.childState, changeArgs)
        ) {
          logTrace(log => log(
            `[globalStateUpdateSubscribedComponents] updating subscriberId: ${uniqueId}'`,
            { uniqueId, parentSub }
          ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

          parentSub.onUpdate(changeArgs, parentSub.fullQualifiedName);
        } else {
          logTrace(log => log(
            `[globalStateUpdateSubscribedComponents] skipping subscriberId: ${uniqueId}'`,
            { uniqueId, parentSub }
          ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);
        }
      }
    });
  }

  // children
  if (thisSubs && (updateState.childState && evaluateGlobalStateComponentChangeTrigger(updateState.childState, changeArgs))) {
    recursiveIteration(
      Object.values(thisSubs.children),
      t => Object.values(t.item.children),
      ({ item: childSubs }) => {
        logTrace(log => log(
          `[globalStateUpdateSubscribedComponents] updating child state: '${childSubs.fullQualifiedName}'`,
          { updateState, childSubs }
        ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

        for (const [uniqueId, childSub] of Object.entries(childSubs.subscriptions)) {
          if (childSub.subscribedState.parentState &&
            evaluateGlobalStateComponentChangeTrigger(childSub.subscribedState.parentState, changeArgs)
          ) {
            logTrace(log => log(
              `[globalStateUpdateSubscribedComponents] updating subscriberId: ${uniqueId}'`,
              { uniqueId, childSub }
            ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

            childSub.onUpdate(changeArgs, childSub.fullQualifiedName);
          }
          else {
            logTrace(log => log(
              `[globalStateUpdateSubscribedComponents] skipping subscriberId: ${uniqueId}'`,
              { uniqueId, childSub }
            ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);
          }
        }
      }
    );
  }
};

REACT_SIMPLE_STATE.DI.subscription.globalStateUpdateSubscribedComponents = updateSubscribedGlobalStateComponents_default;

export const globalStateUpdateSubscribedComponents = <State>(
  changeArgs: GlobalStateChangeArgs<State>,
  options?: SetStateOptions<State>,
  globalStateRoot?: GlobalStateRoot<unknown>
) => {
  REACT_SIMPLE_STATE.DI.subscription.globalStateUpdateSubscribedComponents(
    changeArgs,
    options || {},
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    updateSubscribedGlobalStateComponents_default
  );
};
