type PropertyNames<Type> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [Property in keyof Type]: Type[Property] extends Function ? never : Property;
};

export type Properties<Type> = Pick<Type, PropertyNames<Type>[keyof PropertyNames<Type>]>;
