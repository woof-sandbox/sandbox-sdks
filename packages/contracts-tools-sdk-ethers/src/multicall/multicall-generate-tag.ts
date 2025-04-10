export const multicallGenerateTag = (): string =>
  `tag:${Date.now()}:${crypto.randomUUID()}`;
