import { deepCopyObject, newGuid, sameObjects } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { resetGlobalState } from "functions";
import { getGlobalState, setGlobalState } from "globalstate/functions";
import { TEST_DATA } from "globalstate/test.data";
import { GlobalStateChangeArgs, GlobalStateSubscription, subscribeToGlobalState } from "subscriptions";

it('setGlobalState.rootState', () => {
  // clear global state
  resetGlobalState();
  const copy = deepCopyObject(TEST_DATA);
  setGlobalState("", TEST_DATA);

  expect(sameObjects(REACT_SIMPLE_STATE.ROOT_STATE.state, TEST_DATA)).toBe(true);

  const state = getGlobalState("");
  expect(state).toBeDefined();
  expect(sameObjects(state, TEST_DATA)).toBe(true);
});

it('setGlobalState.childState.value', () => {
  // clear global state
  resetGlobalState();
  setGlobalState("a.b.c", 2);

  const value = (REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b?.c;
  expect(value).toBe(2);

  const value2 = getGlobalState("a.b.c");
  expect(value2).toBe(2);
});

it('setGlobalState.childState.update.thisState', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  
  let changeArgs: GlobalStateChangeArgs<typeof TEST_DATA.a.b.c> | undefined;
  let subscription: GlobalStateSubscription<typeof TEST_DATA.a.b.c> | undefined;

  const onUpdate = jest.fn((t1, t2) => {
    changeArgs = t1;
    subscription = t2;
  });

  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate });
  setGlobalState("a.b.c", 2);

  expect(onUpdate).toHaveBeenCalledTimes(1);
  
  expect(changeArgs).toBeDefined();  
  expect(changeArgs?.fullQualifiedName).toBe("a.b.c");
  expect(changeArgs?.oldState).toBeUndefined();
  expect(changeArgs?.newState).toBe(2);
  
  expect(subscription).toBeDefined();
  expect(subscription?.fullQualifiedName).toBe("a.b.c");
});

// components subscribed to parent states are not updated by default
it('setGlobalState.childState.update.parentState.notCalled', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  let args: GlobalStateChangeArgs<typeof TEST_DATA.a> | undefined;
  const onUpdate = jest.fn(t => { args = t; });

  subscribeToGlobalState(uniqueId, {
    fullQualifiedName: "a",
    updateFilter: { childState: false },
    onUpdate
  });

  setGlobalState("a.b.c", 2);

  expect(onUpdate).toHaveBeenCalledTimes(0);
});

// components subscribed to parent states can be updated if the component subscription and the setGlobalState() call specify it both
it('setGlobalState.childState.update.parentState.called', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();

  let changeArgs: GlobalStateChangeArgs<typeof TEST_DATA.a.b.c> | undefined;
  let subscription: GlobalStateSubscription<typeof TEST_DATA.a> | undefined;

  const onUpdate = jest.fn((t1, t2) => {
    changeArgs = t1;
    subscription = t2;
  });

  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a", onUpdate });
  setGlobalState("a.b.c", 2);

  expect(onUpdate).toHaveBeenCalledTimes(1);

  expect(changeArgs).toBeDefined();
  expect(changeArgs?.fullQualifiedName).toBe("a.b.c");
  expect(changeArgs?.oldState).toBeUndefined();
  expect(changeArgs?.newState).toBe(2);

  expect(subscription).toBeDefined();
  expect(subscription?.fullQualifiedName).toBe("a");
});

it('setGlobalState.childState.update.childState.called', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();

  let changeArgs: GlobalStateChangeArgs<typeof TEST_DATA.a.b> | undefined;
  let subscription: GlobalStateSubscription<typeof TEST_DATA.a.b.c> | undefined;

  const onUpdate = jest.fn((t1, t2) => {
    changeArgs = t1;
    subscription = t2;
  });

  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate });
  setGlobalState("a.b", { c: 2 });

  expect(onUpdate).toHaveBeenCalledTimes(1);

  expect(changeArgs).toBeDefined();
  expect(changeArgs?.fullQualifiedName).toBe("a.b");
  expect(changeArgs?.oldState).toBeUndefined();
  expect(sameObjects(changeArgs?.newState, { c: 2 })).toBe(true);

  expect(subscription).toBeDefined();
  expect(subscription?.fullQualifiedName).toBe("a.b.c");
});

it('setGlobalState.childState.update.childState.called.conditional.triggerPath', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  const onUpdate1 = jest.fn();
  const onUpdate2 = jest.fn();

  // without condition it's called twice
  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate: onUpdate2 });

  setGlobalState("a", { b: { c: 2 } });
  setGlobalState("a.b", { c: 3 });

  expect(onUpdate2).toHaveBeenCalledTimes(2);

  // with condition it's called once only (subscribing again with the same uniqeId will overwrite the previous subscription)
  subscribeToGlobalState(uniqueId, {
    fullQualifiedName: "a.b.c",
    updateFilter: {
      condition: t => t.fullQualifiedName === "a.b"
    },
    onUpdate: onUpdate1
  });

  setGlobalState("a", { b: { c: 2 } });
  setGlobalState("a.b", { c: 3 });

  expect(onUpdate1).toHaveBeenCalledTimes(1);
});

it('setGlobalState.childState.update.childState.called.conditional.value', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  const onUpdate1 = jest.fn();
  const onUpdate2 = jest.fn();

  // without condition it's called twice
  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate: onUpdate2 });

  setGlobalState("a", { b: { c: 2 } });
  setGlobalState("a.b", { c: 3 });

  expect(onUpdate2).toHaveBeenCalledTimes(2);

  // with condition it's called once only (subscribing again with the same uniqeId will overwrite the previous subscription)
  subscribeToGlobalState<typeof TEST_DATA.a.b>(uniqueId, {
    fullQualifiedName: "a.b.c",
    updateFilter: {
      condition: t => t.oldState?.c !== t.newState.c
    },
    onUpdate: onUpdate1
  });

  setGlobalState("a", { b: { c: 2 } });
  setGlobalState("a.b", { c: 3 });

  expect(onUpdate1).toHaveBeenCalledTimes(1);
});
