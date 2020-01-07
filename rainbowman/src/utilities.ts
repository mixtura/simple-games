export type Exact<T, Shape> =
  // Check if `T` is matching `Shape`
  T extends Shape
    // Does match
    // Check if `T` has same keys as `Shape`
    ? Exclude<keyof T, keyof Shape> extends never
      // `T` has same keys as `Shape`
      ? T
      // `T` has more keys than `Shape`
      : never
    // Does not match at all
    : never;
