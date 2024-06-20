import { ChildMemberInfoWithCallbacks, getChildMemberInfo, splitFullQualifiedName } from "@react-simple/react-simple-mapping";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeArgs, GlobalStateSubscription, GlobalStateSubscriptionsEntry } from "./types";
import { Guid, Optional, forEachReverse, logTrace, recursiveIteration } from "@react-simple/react-simple-util";
import { GlobalStateRoot, SetGlobalStateOptions } from "types";

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
  subscription: Optional<GlobalStateSubscription<State>, "updateFilter">,
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
          updateFilter: subscription.updateFilter || {}
        }
      },
      children: {}
    });
  }
  else {
    subs.subscriptions[uniqueId] = {
      ...subscription,
      updateFilter: subscription.updateFilter || {}
    }
  }
};

REACT_SIMPLE_STATE.DI.subscription.subscribeToGlobalState = subscribeToGlobalState_default;

export const subscribeToGlobalState = <State>(
  uniqueId: Guid,
  subscription: Optional<GlobalStateSubscription<State>, "updateFilter">,
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

const updateGlobalStateSubscribedComponents_default = <State>(
  changeArgs: GlobalStateChangeArgs<State>,
  options: SetGlobalStateOptions<State>,
  globalStateRoot: GlobalStateRoot<unknown>
) => {
  const { fullQualifiedName } = changeArgs;
  const { updateStates = {} } = options;

  logTrace(log => log(
    `[updateGlobalStateSubscribedComponents] fullQualifiedName=${fullQualifiedName}`,
    { args: { fullQualifiedName, changeArgs, options, globalStateRoot } }
  ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

  if (updateStates !== false &&
    updateStates.condition?.(changeArgs) !== false
  ) {
    const thisSubs = getGlobalStateSubscriptions<State>(fullQualifiedName, false, globalStateRoot);

    // this state
    if (thisSubs && updateStates.thisState !== false) {
      logTrace(log => log(
        `[updateGlobalStateSubscribedComponents] updating this state: '${thisSubs.fullQualifiedName}'`,
        { args: { updateStates, thisSubs, globalStateRoot } }
      ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

      for (const [uniqueId, thisSub] of Object.entries(thisSubs.subscriptions)) {
        if (thisSub.updateFilter !== false &&
          thisSub.updateFilter.thisState !== false &&          
          thisSub.updateFilter.condition?.(changeArgs) !== false &&
          (!thisSub.updateFilter.fullQualifiedNames || thisSub.updateFilter.fullQualifiedNames.includes(fullQualifiedName)) &&
          (!updateStates.fullQualifiedNames || updateStates.fullQualifiedNames.includes(thisSub.fullQualifiedName))
        ) {
          logTrace(log => log(
            `[updateGlobalStateSubscribedComponents] updating subscriberId: ${uniqueId}'`,
            { args: { uniqueId, thisSub, globalStateRoot } }
          ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

          thisSub.onUpdate(changeArgs, thisSub);
        }
        else {
          logTrace(log => log(
            `[updateGlobalStateSubscribedComponents] skipping subscriberId: ${uniqueId}'`,
            { args: { uniqueId, thisSub, globalStateRoot } }
          ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

          thisSub.onUpdateSkipped?.(changeArgs, thisSub);
        }
      }
    }

    // parents
    if (updateStates?.parentState !== false) {
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
          `[updateGlobalStateSubscribedComponents] updating parent state: '${parentSubs.fullQualifiedName}'`,
          { args: { updateStates, parentSubs, globalStateRoot } }
        ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

        for (const [uniqueId, parentSub] of Object.entries(parentSubs.subscriptions)) {
          if (parentSub.updateFilter !== false &&
            parentSub.updateFilter.childState !== false &&
            parentSub.updateFilter.condition?.(changeArgs) !== false &&
            (!parentSub.updateFilter.fullQualifiedNames || parentSub.updateFilter.fullQualifiedNames.includes(fullQualifiedName)) &&
            (!updateStates.fullQualifiedNames || updateStates.fullQualifiedNames.includes(parentSub.fullQualifiedName))
          ) {
            logTrace(log => log(
              `[updateGlobalStateSubscribedComponents] updating subscriberId: ${uniqueId}'`,
              { args: { uniqueId, parentSub, globalStateRoot } }
            ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

            parentSub.onUpdate(changeArgs, parentSub);
          } else {
            logTrace(log => log(
              `[updateGlobalStateSubscribedComponents] skipping subscriberId: ${uniqueId}'`,
              { args: { uniqueId, parentSub, globalStateRoot } }
            ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

            parentSub.onUpdateSkipped?.(changeArgs, parentSub);
          }
        }
      });
    }

    // children
    if (thisSubs && updateStates?.childState !== false) {
      recursiveIteration(
        Object.values(thisSubs.children),
        t => Object.values(t.item.children),
        ({ item: childSubs }) => {
          logTrace(log => log(
            `[updateGlobalStateSubscribedComponents] updating child state: '${childSubs.fullQualifiedName}'`,
            { args: { updateStates, childSubs, globalStateRoot } }
          ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

          for (const [uniqueId, childSub] of Object.entries(childSubs.subscriptions)) {
            if (childSub.updateFilter !== false &&
              childSub.updateFilter.parentState !== false &&
              childSub.updateFilter.condition?.(changeArgs) !== false &&
              (!childSub.updateFilter.fullQualifiedNames || childSub.updateFilter.fullQualifiedNames.includes(fullQualifiedName)) &&
              (!updateStates.fullQualifiedNames || updateStates.fullQualifiedNames.includes(childSub.fullQualifiedName))
            ) {
              logTrace(log => log(
                `[updateGlobalStateSubscribedComponents] updating subscriberId: ${uniqueId}'`,
                { args: { uniqueId, childSub, globalStateRoot } }
              ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

              childSub.onUpdate(changeArgs, childSub);
            }
            else {
              logTrace(log => log(
                `[updateGlobalStateSubscribedComponents] skipping subscriberId: ${uniqueId}'`,
                { args: { uniqueId, childSub, globalStateRoot } }
              ), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

              childSub.onUpdateSkipped?.(changeArgs, childSub);
            }
          }
        }
      );
    }
  }
};

REACT_SIMPLE_STATE.DI.subscription.updateGlobalStateSubscribedComponents = updateGlobalStateSubscribedComponents_default;

export const updateGlobalStateSubscribedComponents = <State>(
  changeArgs: GlobalStateChangeArgs<State>,
  options?: SetGlobalStateOptions<State>,
  globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
) => {
  REACT_SIMPLE_STATE.DI.subscription.updateGlobalStateSubscribedComponents(
    changeArgs,
    options || {},
    globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
    updateGlobalStateSubscribedComponents_default
  );
};
