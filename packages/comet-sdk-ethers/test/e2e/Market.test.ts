import { IMarket, PERCENT_PRECISION } from "@sandbox/comet-sdk";
import { Market } from "../../src/augment/Market";


import {beforeAll, describe, expect, test} from "vitest";
import {ethers} from "ethers";

const percentsReg = new RegExp(`^\\d+\\.\\d{${PERCENT_PRECISION}}$`);
const RPC_URL = "https://eth.llamarpc.com";
const data: IMarket = {
    cometAddress: "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840",
} as const;

let market = new Market(data);

describe("MarketMethods", () => {
    beforeAll(async () => {
        market = await Market.fetch(data.cometAddress, new ethers.JsonRpcProvider(RPC_URL));
    });

    test("should calculate the correct borrow APR", async () => {
        const percents = market.borrowApr;
        expect(percents).to.be.match(percentsReg);
    });

    test("should calculate the correct supply APR", () => {
        const percents = market.supplyApr;
        expect(percents).to.be.match(percentsReg);
    });
});
