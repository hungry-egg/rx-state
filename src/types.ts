export type Unsubscribable = { unsubscribe: () => void };

export type Subscribable<T = any> = {
  subscribe: (callback: (value: T) => void) => Unsubscribable;
};

export type ObservableLookup = { [name: string]: Subscribable };

// Can't seem to find a way to use Subscribable[] or [...Subscribable[]]
//   in a way that doesn't lose type information.
// For example, when unwrapping [Subscribable<boolean>, Subscribable<string>],
//   we want [boolean, string], NOT (boolean | string)[]
// This seems the only way to keep that type information, so for now,
//   just allow up to 8 in the tuple.
export type ObservableTuple =
  | [Subscribable]
  | [Subscribable, Subscribable]
  | [Subscribable, Subscribable, Subscribable]
  | [Subscribable, Subscribable, Subscribable, Subscribable]
  | [Subscribable, Subscribable, Subscribable, Subscribable, Subscribable]
  | [
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable
    ]
  | [
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable
    ]
  | [
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable,
      Subscribable
    ];

// Subscribable<number> ----> number
export type UnwrapObservable<Obs> = Obs extends Subscribable<infer T>
  ? T
  : never;

// { a: Subscribable<number>, b: Subscribable<string> } ----> { a: number, b: string }
export type UnwrapObservableLookup<
  TObservableLookup extends ObservableLookup | ObservableTuple
> = {
  [Key in keyof TObservableLookup]: UnwrapObservable<TObservableLookup[Key]>;
};

// [ Subscribable<number>, Subscribable<string> ] ----> [ number, string ]
export type UnwrapObservableTuple<TObservables extends ObservableTuple> = {
  [Index in keyof TObservables]: TObservables[Index] extends Subscribable<
    infer TValue
  >
    ? TValue
    : never;
};

export type UnwrapAny<TObs> = TObs extends Subscribable
  ? UnwrapObservable<TObs>
  : TObs extends ObservableTuple
  ? UnwrapObservableTuple<TObs>
  : TObs extends ObservableLookup
  ? UnwrapObservableLookup<TObs>
  : never;
