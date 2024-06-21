import { deepCopyObject, sameObjects } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { resetGlobalState } from "functions";
import { getGlobalState, setGlobalState } from "globalstate/functions";
import { TEST_DATA } from "globalstate/test.data";

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
