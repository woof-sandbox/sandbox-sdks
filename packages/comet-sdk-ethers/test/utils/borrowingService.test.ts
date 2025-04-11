import { describe, it, expect, vi, beforeEach } from "vitest";
import { BorrowingService } from "../../src/services/borrowing";
import { JsonRpcProvider, Wallet, ethers } from "ethers";
import { CometContract } from "../../src/contracts";
import { SERVICES_ERRORS } from "../../src/errors/services";
import { MulticallContract } from "@sandbox/contracts-tools-sdk-ethers";

vi.mock("../../src/contracts", () => ({
    CometContract: vi.fn().mockImplementation(() => ({
        getBorrowBalanceOfCall: vi.fn(),
        getCollateralBalanceOfCall: vi.fn(),
        getLiquidationFactorCall: vi.fn(),
        isAllowed: vi.fn().mockResolvedValue(true),
        allow: vi.fn().mockResolvedValue({ hash: "0x123" }),
    })),
}));

vi.mock("@sandbox/contracts-tools-sdk-ethers", () => {
    const originalModule = vi.importActual("@sandbox/contracts-tools-sdk-ethers");
    return {
        ...originalModule,
        MulticallContract: vi.fn().mockImplementation(() => ({
            add: vi.fn(),
            run: vi.fn().mockResolvedValue(undefined),
            getSingle: vi.fn((tag) => {
                if (tag === "borrowBalance") return BigInt(500);
                if (tag === "collateralBalanceOf") return BigInt(2000);
                if (tag === "getLiquidationFactor") return BigInt(1e18);
                return null;
            }),
        })),
        Contract: vi.fn(),
    };
});

describe("BorrowingService", () => {
    let service: BorrowingService;

    beforeEach(() => {
        service = new BorrowingService(
            "http://localhost:8545",
            "0x012345678901234567890123456789012345678901234567890123456789abcd");
    });

    it("should return signer when private key is provided", () => {
        expect(service.getDriver()).toBeInstanceOf(Wallet);
    });

    it("should throw if getSigner is called without private key", () => {
        const serviceWithoutSigner = new BorrowingService("http://localhost:8545");
        expect(() => serviceWithoutSigner.getSigner()).toThrow(
            SERVICES_ERRORS.SIGNER_IS_NOT_PROVIDED
        );
    });

    it("should return available borrow amount", async () => {
        const amount = await service.getAvailableBorrowAmount(
            "0xCometAddress",
            "0xUserAddress"
        );
        expect(amount).toBe(BigInt(1500));
    });

    it("should check if borrowing is allowed", async () => {
        const isAllowed = await service.isBorrowAllowed(
            "0xCometAddress",
            "0xUserAddress",
            "0xBulkerAddress"
        );
        expect(isAllowed).toBe(true);
    });

    it("should allow borrowing", async () => {
        const tx = await service.allowBorrow("0xCometAddress", "0xBulkerAddress");
        expect(tx).toEqual({ hash: "0x123" });
    });
});