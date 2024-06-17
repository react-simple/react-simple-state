import { newGuid, sameObjects } from "@react-simple/react-simple-util";
import exp from "constants";
import { REACT_SIMPLE_STATE } from "data";
import { resetGlobalState } from "functions";
import { getGlobalStateSubscriptions, subscribeToGlobalState } from "subscription";

it('subscribeToGlobalState.rootState', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  const onUpdate = jest.fn();

  subscribeToGlobalState(uniqueId, {
    fullQualifiedName: "",
    onUpdate
  });

  const subscription = REACT_SIMPLE_STATE.ROOT_STATE.subscriptions.subscriptions[uniqueId];

  expect(subscription).toBeDefined();
  expect(subscription.fullQualifiedName).toBe("");
  expect(sameObjects(subscription.subscribedState, REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultSubscribeFilters)).toBe(true);
  expect(subscription.onUpdate).toBe(onUpdate);
});

it('subscribeToGlobalState.childState', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  const onUpdate = jest.fn();

  subscribeToGlobalState(uniqueId, {
    fullQualifiedName: "a.b.c",
    onUpdate
  });

  const subscriptions = REACT_SIMPLE_STATE.ROOT_STATE.subscriptions.children["a"]?.children?.["b"]?.children?.["c"];
  expect(subscriptions).toBeDefined();

  const subscriptions2 = getGlobalStateSubscriptions("a.b.c");
  expect(subscriptions2).toBeDefined();
  expect(subscriptions2).toBe(subscriptions);

  const subscription = subscriptions.subscriptions[uniqueId];

  expect(subscription).toBeDefined();
  expect(subscription.fullQualifiedName).toBe("a.b.c");
  expect(sameObjects(subscription.subscribedState, REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultSubscribeFilters)).toBe(true);
  expect(subscription.onUpdate).toBe(onUpdate);
});
