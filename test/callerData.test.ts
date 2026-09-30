import { withoutKeys } from "../src/utils/callerData";

test("withoutKeys keeps plain fields and drops every key attribute", () => {
  const data = {
    name: "n", amount: 1, gasFunding: "x", gs5pkNote: "kept", pkg: "kept",
    pk: "account#B", sk: "order#x", gs1pk: "a", gs1sk: "b", gs5pk: "c", gs12sk: "d", _type: "Order",
  };
  expect(withoutKeys(data)).toEqual({ name: "n", amount: 1, gasFunding: "x", gs5pkNote: "kept", pkg: "kept" });
});

test("withoutKeys drops the extra fields asked for", () => {
  expect(withoutKeys({ id: "i", resellerAccountId: "r", name: "n" }, ["id", "resellerAccountId"])).toEqual({ name: "n" });
});

test("withoutKeys leaves the caller's object untouched and accepts nothing", () => {
  const data = { pk: "p", name: "n" };
  withoutKeys(data);
  expect(data).toEqual({ pk: "p", name: "n" });
  expect(withoutKeys(undefined)).toEqual({});
});
