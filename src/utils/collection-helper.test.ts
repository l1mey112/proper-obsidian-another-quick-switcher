import {
  count,
  equalsAsSet,
  intersection,
  omitBy,
  range,
} from "./collection-helper";
import { describe, expect, test } from "@jest/globals";

describe.each<{ n: number; expected: number[] }>`
  n    | expected
  ${0} | ${[]}
  ${1} | ${[0]}
  ${2} | ${[0, 1]}
  ${3} | ${[0, 1, 2]}
`("range", ({ n, expected }) => {
  test(`range(${n}) = ${expected}`, () => {
    expect(range(n)).toStrictEqual(expected);
  });
});

describe.each<{ values: number[][]; expected: number[] }>`
  values                    | expected
  ${[[1, 2], [2, 3]]}       | ${[2]}
  ${[[1, 2, 3], [2, 3, 4]]} | ${[2, 3]}
  ${[[1, 2], [3, 4]]}       | ${[]}
  ${[[], []]}               | ${[]}
  ${[]}                     | ${[]}
`("intersection", ({ values, expected }) => {
  test(`intersection(${values}) = ${expected}`, () => {
    expect(intersection(values)).toStrictEqual(expected);
  });
});

describe.each<{ values: string[]; expected: { [x: string]: number } }>`
  values                | expected
  ${["aa", "ii", "aa"]} | ${{ aa: 2, ii: 1 }}
`("count", ({ values, expected }) => {
  test(`count(${values}) = ${expected}`, () => {
    expect(count(values)).toStrictEqual(expected);
  });
});

describe.each<{ ary1: string[]; ary2: string[]; expected: boolean }>`
  ary1      | ary2      | expected
  ${[1]}    | ${[1]}    | ${true}
  ${[1, 2]} | ${[1, 2]} | ${true}
  ${[1, 2]} | ${[2, 1]} | ${true}
  ${[]}     | ${[]}     | ${true}
  ${[1]}    | ${[2]}    | ${false}
  ${[1, 2]} | ${[2, 2]} | ${false}
`("equalsAsSet", ({ ary1, ary2, expected }) => {
  test(`equalsAsSet(${ary1}, ${ary2}) = ${expected}`, () => {
    expect(equalsAsSet(ary1, ary2)).toStrictEqual(expected);
  });
});

describe.each<{
  obj: any;
  shouldOmit: (key: string, value: any) => boolean;
  expected: any;
}>`
  obj                     | shouldOmit                                 | expected
  ${{ id: 1, name: "a" }} | ${(k: string, _: unknown) => k === "id"}   | ${{ name: "a" }}
  ${{ id: 2, name: "a" }} | ${(k: string, _: unknown) => k === "name"} | ${{ id: 2 }}
  ${{ id: 3, name: "a" }} | ${(k: string, _: unknown) => false}        | ${{ id: 3, name: "a" }}
  ${{ id: 4, name: "a" }} | ${(k: string, _: unknown) => true}         | ${{}}
`("omitBy", ({ obj, shouldOmit, expected }) => {
  test(`omitBy(${JSON.stringify(obj)}, shouldOmit) = ${JSON.stringify(
    expected,
  )}`, () => {
    expect(omitBy(obj, shouldOmit)).toStrictEqual(expected);
  });
});
