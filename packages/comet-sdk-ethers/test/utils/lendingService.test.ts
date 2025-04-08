import { describe, it, expect, vi, beforeEach } from "vitest";
import { LendingService } from "../../src/services/lending";
import { ethers } from "ethers";
import { CometContract, Erc20Contract } from "../../src/contracts";
import { SERVICES_ERRORS } from "../../src/errors/services";

vi.mock("../../src/contracts", () => ({
    Erc20Contract: vi.fn().mockImplementation(() => ({
        allowance: vi.fn().mockResolvedValue(100n),
        approve: vi.fn().mockResolvedValue({ hash: "0x123" }),
    })),
    CometContract: vi.fn().mockImplementation(() => ({
        isAllowed: vi.fn().mockResolvedValue(true),
        allow: vi.fn().mockResolvedValue({ hash: "0x456" }),
    })),
}));

describe("LendingService", () => {
    const rpcUrl = "https://rpc.example.com";
    const privateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    let service: LendingService;

    beforeEach(() => {
        service = new LendingService(rpcUrl, privateKey);
    });

    it("should return the correct provider or signer", () => {
        expect(service.getDriver()).toBeInstanceOf(ethers.Wallet);
    });

    it("should throw an error if signer is not provided", () => {
        const serviceWithoutSigner = new LendingService(rpcUrl);
        expect(() => serviceWithoutSigner.getSigner()).toThrow(SERVICES_ERRORS.SIGNER_IS_NOT_PROVIDED);
    });

    it("should get allowance correctly", async () => {
        const allowance = await service.getAllowance("0xToken", "0xOwner", "0xSpender");
        expect(allowance).toBe(100n);
    });

    it("should check if user is allowed on Comet", async () => {
        const allowed = await service.isAllowed("0xComet", "0xOwner", "0xBulker");
        expect(allowed).toBe(true);
    });

    it("should approve token correctly", async () => {
        const tx = await service.approveToken("0xToken", "0xSpender", 1000n);
        expect(tx.hash).toBe("0x123");
    });

    it("should allow comet access correctly", async () => {
        const tx = await service.allowComet("0xComet", "0xBulker", true);
        expect(tx.hash).toBe("0x456");
    });
});
