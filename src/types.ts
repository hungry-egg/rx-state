import { Subscription } from "rxjs";

export type StatefulObservable<T = any> = {
  subscribe: (callback: (value: T) => void) => Subscription;
};

export type ObservableLookup = { [name: string]: StatefulObservable };

// Can't seem to find a way to use StatefulObservable[] or [...StatefulObservable[]]
//   in a way that doesn't lose type information.
// For example, when unwrapping [StatefulObservable<boolean>, StatefulObservable<string>],
//   we want [boolean, string], NOT (boolean | string)[]
// This seems the only way to keep that type information, so for now,
//   just allow up to 8 in the tuple.
export type ObservableTuple =
  | [StatefulObservable]
  | [StatefulObservable, StatefulObservable]
  | [StatefulObservable, StatefulObservable, StatefulObservable]
  | [
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable
    ]
  | [
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable
    ]
  | [
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable
    ]
  | [
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable
    ]
  | [
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable,
      StatefulObservable
    ];

// StatefulObservable<number> ----> number
export type UnwrapObservable<Obs> = Obs extends StatefulObservable<infer T>
  ? T
  : never;

// { a: StatefulObservable<number>, b: StatefulObservable<string> } ----> { a: number, b: string }
export type UnwrapObservableLookup<
  TObservableLookup extends ObservableLookup | ObservableTuple
> = {
  [Key in keyof TObservableLookup]: UnwrapObservable<TObservableLookup[Key]>;
};

// [ StatefulObservable<number>, StatefulObservable<string> ] ----> [ number, string ]
export type UnwrapObservableTuple<TObservables extends ObservableTuple> = {
  [Index in keyof TObservables]: TObservables[Index] extends StatefulObservable<
    infer TValue
  >
    ? TValue
    : never;
};

export type UnwrapAny<TObs> = TObs extends StatefulObservable
  ? UnwrapObservable<TObs>
  : TObs extends ObservableTuple
  ? UnwrapObservableTuple<TObs>
  : TObs extends ObservableLookup
  ? UnwrapObservableLookup<TObs>
  : never;
