import { http, createConfig } from "@wagmi/core";
import { sepolia } from "@wagmi/core/chains";
import { Base, IMarket} from "@woof-software/comet-sdk";
import { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";
import { wagmiConfig } from "../../src";
import {sepoliaAddressConfig} from "../address-e2e.config";

const RPC_URL = sepoliaAddressConfig.rpcUrl;
const data: Partial<IMarket> = {
    cometAddress: sepoliaAddressConfig.comet1,
} as const;

let base: Base;

describe("Base Methods", () => {
    beforeAll(async () => {
        createConfig({
            chains: [sepolia],
            transports: {
                [sepolia.id]: http(RPC_URL),
            },
        });

        base = await Base.fetch(
            data.cometAddress as Address,
            sepolia.id,
            wagmiConfig,
        );
    });

    test("should contain baseMinForRewards", () => {
        expect(base.baseMinForRewards, "baseMinForRewards is missing").to.be.a("bigint");
        expect(base.baseMinForRewards, "baseMinForRewards is not valid").greaterThan(0);
    });

    test("should contain baseTrackingBorrowSpeed", () => {
        expect(base.baseTrackingBorrowSpeed, "baseTrackingBorrowSpeed is missing").to.be.a("bigint");
    });

    test("should contain baseTrackingSupplySpeed", () => {
        expect(base.baseTrackingSupplySpeed, "baseTrackingSupplySpeed is missing").to.be.a("bigint");
    });

    test("should contain baseIndexScale", () => {
        expect(base.baseIndexScale, "baseIndexScale is missing").to.be.a("bigint");
        expect(base.baseIndexScale, "baseIndexScale is not valid").greaterThan(0);
    });

    test("should contain curvePresets", () => {
        expect(base.curvePresets.length, "curvePresets not valid").greaterThan(0);
    });
});