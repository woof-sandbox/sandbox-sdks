import type { MulticallTags, Tagable } from "../types";

export const multicallNormalizeTags = (tags: MulticallTags): Tagable => {
    if (typeof tags === "object" || Array.isArray(tags)) {
        return JSON.stringify(tags, (_, value) =>
            typeof value === "bigint" ? value.toString() : value,
        );
    }
    return tags;
};
