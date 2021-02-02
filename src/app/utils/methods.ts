export const join = (...args: string[]) => {
    if (args?.length < 1) {
        return null;
    }
    let s = args[0];
    for (const a of args.slice(1)) {
        s += '/' + a;
    }
    return s;
};
