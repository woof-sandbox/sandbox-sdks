import {type IMarket} from "@sandbox/comet-sdk";
import {UserMarket} from "../../src/augment";

import {arbitrum} from "@wagmi/core/chains";
import {ethers} from "ethers";
import {beforeAll, describe, expect, test} from "vitest";
import {UserMarketWrapper} from "../../src/wrapper/UserMarketWrapper";

const RPC_URL = "https://eth.llamarpc.com";

const data: Partial<IMarket> = {
    cometAddress: "0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07",
} as const;

let market: UserMarketWrapper;

describe("UserMarketWrapper", () => {
    beforeAll(async () => {
        const userMarket = await UserMarket.fetch(
            data.cometAddress as `0x${string}`,
            arbitrum.id,
            "0x23eEF61AB548a8852117561689886f583FC0E2B7",
            new ethers.JsonRpcProvider(RPC_URL),
        );

        market = new UserMarketWrapper(userMarket);
    });

    test("check supply", async () => {
        const supply = market.supplyMarket('0.01');
        console.log('--supply-', supply)
    });

    test("check borrow", async () => {
        const borrow = market.borrowMarket('0.01');
        console.log('--borrow-', borrow)
    });

    test("check withDraw", async () => {
        const withDraw = market.withDrawMarket('0.01', false);
        console.log('--withDraw-', withDraw)
    });

    test("check availableLiquidity", async () => {
        const availableLiquidity = Number(market.availableLiquidity);
        expect(availableLiquidity).to.be.greaterThan(0);
    });
    test("check supplyRate", async () => {
        const supplyRate = Number(market.supplyRate);
        expect(supplyRate).to.be.greaterThan(0);
    });
    test("check borrowRate", async () => {
        const borrowRate = Number(market.borrowRate);
        expect(borrowRate).to.be.greaterThan(0);
    });

    test("check utilization", async () => {
        const utilization = Number(market.utilization);
        expect(utilization).to.be.greaterThan(0);
    });

    test("check supply user", async () => {
        const userSupply = Number(market.supplyBalance);
        expect(userSupply).to.be.greaterThan(0);
    });
});
