import { ChildMemberInfoWithCallbacks, getChildMemberInfo, splitFullQualifiedName } from "@react-simple/react-simple-mapping";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeArgs, GlobalStateUpdateConditions, GlobalStateSubscription, GlobalStateSubscriptionsEntry } from "./types";
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
      }),
      deleteMember: (parent, names) => {
        delete (parent as GlobalStateSubscriptionsEntry<unknown>).children[names.name];
        return true;
      }
    }
  );
}

REACT_SIMPLE_STATE.DI.subscription.getGlobalStateSubscriptionsMemberInfo = getGlobalStateSubscriptionsMemberInfo_default;

export function getGlobalStateSubscriptionsMemberInfo<State>(
  fullQualifiedName: string,
  createEntryIfMissing?: boolean, // if set won't return undefined
  globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
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
  globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
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
  subscription: Omit<GlobalStateSubscription<State>, "subscribedState"> & { subscribedState?: Partial<GlobalStateUpdateConditions<State>> },
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const member = getGlobalStateSubscriptionsMemberInfo<State>(subscription.fullQualifiedName, true, globalStateRoot)!;
  const subs = member.getValue();
  
  if (!subs) {
    member.setValue({
      fullQualifiedName: subscription.fullQualifiedName,
      subscriptions: {
        [uniqueId]: {
          ...subscription ,
          subscribedState: subscription.subscribedState || {}
        }
      },
      children: {}
    });
  }
  else {
    subs.subscriptions[uniqueId] = {
      ...subscription,
      subscribedState: subscription.subscribedState || {}
    }
  }
};

REACT_SIMPLE_STATE.DI.subscription.subscribeToGlobalState = subscribeToGlobalState_default;

export const subscribeToGlobalState = <State>(
  uniqueId: Guid,
  subscription: Omit<GlobalStateSubscription<State>, "subscribedState"> & { subscribedState?: Partial<GlobalStateUpdateConditions<State>> },
  globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
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
  fullQualifiedName: string,
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const subs = getGlobalStateSubscriptions(fullQualifiedName, false, globalStateRoot);

  if (subs) {
    delete subs.subscriptions[uniqueId];
  }
};

REACT_SIMPLE_STATE.DI.subscription.unsubscribeFromGlobalState = unsubscribeFromGlobalState_default;

export const unsubscribeFromGlobalState = (
  uniqueId: Guid,
  fullQualifiedName: string,
  globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
) => {
  return REACT_SIMPLE_STATE.DI.subscription.unsubscribeFromGlobalState(
    uniqueId,
    fullQualifiedName,
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    unsubscribeFromGlobalState_default
  );
};

const globalStateUpdateSubscribedComponents_default = <State>(
  changeArgs: GlobalStateChangeArgs<State>,
  options: SetStateOptions<State>,
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const { fullQualifiedName } = changeArgs;
  const { updateState } = options;

  logTrace(log => log(
    `[globalStateUpdateSubscribedComponents] fullQualifiedName=${fullQualifiedName}`,
    { fullQualifiedName, changeArgs, options }
  ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

  if (!updateState?.condition || updateState.condition(changeArgs)) {
    const thisSubs = getGlobalStateSubscriptions<State>(fullQualifiedName, false, globalStateRoot);

    // this state
    if (thisSubs && updateState?.thisState !== false) {
      logTrace(log => log(
        `[globalStateUpdateSubscribedComponents] updating this state: '${thisSubs.fullQualifiedName}'`,
        { updateState, thisSubs }
      ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

      for (const [uniqueId, thisSub] of Object.entries(thisSubs.subscriptions)) {
        if (thisSub.subscribedState.thisState !== false &&
          (!thisSub.subscribedState.condition || thisSub.subscribedState.condition(changeArgs))
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

          thisSub.onUpdateSkipped?.(changeArgs, thisSub.fullQualifiedName);
        }
      }
    }

    // parents
    if (updateState?.parentState !== false) {
      const fullQualifiedNameParts = splitFullQualifiedName(fullQualifiedName, { unwrapArrayIndexers: true });
      const parents: GlobalStateSubscriptionsEntry<unknown>[] = [];
    
      let subs = globalStateRoot.subscriptions;
      // let state = globalStateRoot.state as any;
    
      for (const part of fullQualifiedNameParts) {
        parents.push(subs);

        subs = subs.children[part];
        // state = state[part];

        if (!subs) {
          break;
        }
      }

      forEachReverse(parents, parentSubs => {
        logTrace(log => log(
          `[globalStateUpdateSubscribedComponents] updating parent state: '${parentSubs.fullQualifiedName}'`,
          { updateState, parentSubs }
        ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

        for (const [uniqueId, parentSub] of Object.entries(parentSubs.subscriptions)) {
          if (parentSub.subscribedState.childState !== false &&
            (!parentSub.subscribedState.condition || parentSub.subscribedState.condition(changeArgs))
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

            parentSub.onUpdateSkipped?.(changeArgs, parentSub.fullQualifiedName);
          }
        }
      });
    }

    // children
    if (thisSubs && updateState?.childState !== false) {
      recursiveIteration(
        Object.values(thisSubs.children),
        t => Object.values(t.item.children),
        ({ item: childSubs }) => {
          logTrace(log => log(
            `[globalStateUpdateSubscribedComponents] updating child state: '${childSubs.fullQualifiedName}'`,
            { updateState, childSubs }
          ), null, REACT_SIMPLE_STATE.LOGGING.logLevel);

          for (const [uniqueId, childSub] of Object.entries(childSubs.subscriptions)) {
            if (childSub.subscribedState.parentState !== false &&
              (!childSub.subscribedState.condition || childSub.subscribedState.condition(changeArgs))
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

              childSub.onUpdateSkipped?.(changeArgs, childSub.fullQualifiedName);
            }
          }
        }
      );
    }
  }
};

REACT_SIMPLE_STATE.DI.subscription.globalStateUpdateSubscribedComponents = globalStateUpdateSubscribedComponents_default;

export const globalStateUpdateSubscribedComponents = <State>(
  changeArgs: GlobalStateChangeArgs<State>,
  options?: SetStateOptions<State>,
  globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
) => {
  REACT_SIMPLE_STATE.DI.subscription.globalStateUpdateSubscribedComponents(
    changeArgs,
    options || {},
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    globalStateUpdateSubscribedComponents_default
  );
};
