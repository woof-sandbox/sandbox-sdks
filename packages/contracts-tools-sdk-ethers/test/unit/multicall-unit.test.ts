import { describe, expect, test } from "vitest";
import { CONTRACTS_ERRORS, MULTICALL_ERRORS } from "../../src/errors";
import { MulticallContract } from "../../src";
import { JSON_PROVIDER, RegistryContract } from "../stub";

const registryProvider = new RegistryContract(JSON_PROVIDER);
const multicallProvider = new MulticallContract(JSON_PROVIDER);

describe("Test Multicall Unit", () => {
  test("Multicall should recognize static properly", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(multicallProvider.static).to.be.true;
    multicallProvider.add(0, registryProvider.getOwnerCall());
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(multicallProvider.static).to.be.true;
    multicallProvider.add(1, registryProvider.getRenounceOwnershipCall());
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(multicallProvider.static).to.be.false;
  });

  test("Provider should not process write call", async () => {
    let error;
    try {
      multicallProvider.add(1, registryProvider.getRenounceOwnershipCall());
      await multicallProvider.run().catch((err) => (error = err));
    } catch (err) {
      error = err;
    }
    expect(error).toEqual(CONTRACTS_ERRORS.READ_ONLY_CONTRACT_MUTATION);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(multicallProvider.static).to.be.false;
  });

  test("Should be cleared completely", () => {
    multicallProvider.clear();
    expect(multicallProvider.calls.length).to.be.equal(0);
    expect(multicallProvider.tags.length).to.be.equal(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(multicallProvider.success).to.be.undefined;
  });

  test("Should not allow simultaneous run", async () => {
    let error;
    try {
      multicallProvider.add(1, registryProvider.getOwnerCall());
      await Promise.all([multicallProvider.run(), multicallProvider.run()]);
    } catch (err) {
      error = err;
    }
    expect(error).toEqual(MULTICALL_ERRORS.SIMULTANEOUS_INVOCATIONS);
  });
});
