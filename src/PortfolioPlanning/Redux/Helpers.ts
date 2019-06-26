import { Action } from "redux";

type ActionsCreatorsMapObject = {
    [actionCreator: string]: (...args: any[]) => any;
};
export type ActionsUnion<A extends ActionsCreatorsMapObject> = ReturnType<
    A[keyof A]
>;
export type ActionsOfType<
    ActionUnion,
    ActionType extends string
> = ActionUnion extends Action<ActionType> ? ActionUnion : never;