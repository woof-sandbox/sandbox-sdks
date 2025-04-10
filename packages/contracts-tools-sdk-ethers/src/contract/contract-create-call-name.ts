export const contractCreateCallName = (name: string): string =>
  `${name.startsWith("get") ? name : `get${name[0]!.toUpperCase()}${name.slice(1)}`}Call`;
