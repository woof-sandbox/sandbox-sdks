import { TransactionReceipt, TransactionResponse } from "ethers";
import { describe, expect, test } from "vitest";
import { MulticallContract } from "../../src";
import { waitForAddressTxs } from "../../src/helpers";
import {
  AsyncAbortController,
  MULTICALL_ADDRESS,
  SimpleStorage,
  WALLET,
} from "./local.stub.js";

const storage = new SimpleStorage(WALLET);

// noinspection t
describe("Local Test of MulticallUnit - Testnet", () => {
  test("Test of write calls - do not waitWithSignals", async () => {
    await waitForAddressTxs(WALLET.address, WALLET.provider!);
    const unit = new MulticallContract(
      WALLET,
      {
        maxMutableCallsStack: 2, // Same requests will require more gas for replacing
        waitForTxs: false,
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 1; i++) {
      // 1 because of non-waitWithSignals test - it will require replacement fee
      unit.add([i], storage.setFirstCall(i));
      unit.add([i, i], storage.setSecondCall(i));
    }
    const result = await unit.run();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.true;

    for (let i = 0; i < 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i])).to.be.true;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i, i])).to.be.true;
      expect(unit.getRaw([i])).toBeInstanceOf(TransactionResponse);
      expect(unit.getRaw([i, i])).toBeInstanceOf(TransactionResponse);
    }
  });

  test("Test of write calls - waitWithSignals", async () => {
    await waitForAddressTxs(WALLET.address, WALLET.provider!);
    const unit = new MulticallContract(
      WALLET,
      {
        maxMutableCallsStack: 2, // Same requests will require more gas for replacing
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 3; i++) {
      unit.add([i], storage.setFirstCall(i));
      unit.add([i, i], storage.setSecondCall(i));
    }
    const result = await unit.run();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.true;

    for (let i = 0; i < 3; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i])).to.be.true;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i, i])).to.be.true;
      expect(unit.getRaw([i])).toBeInstanceOf(TransactionReceipt);
      expect(unit.getRaw([i, i])).toBeInstanceOf(TransactionReceipt);
    }
  });

  test("Test of write calls - priority", async () => {
    await waitForAddressTxs(WALLET.address, WALLET.provider!);
    const unit = new MulticallContract(
      WALLET,
      {
        maxMutableCallsStack: 2, // Same requests will require more gas for replacing
        highPriorityTxs: true,
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 3; i++) {
      unit.add([i], storage.setFirstCall(i));
      unit.add([i, i], storage.setSecondCall(i));
    }
    const result = await unit.run();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.true;

    for (let i = 0; i < 3; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i])).to.be.true;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i, i])).to.be.true;
      expect(unit.getRaw([i])).toBeInstanceOf(TransactionReceipt);
      expect(unit.getRaw([i, i])).toBeInstanceOf(TransactionReceipt);
    }

    const unique = new Set(unit.response);

    expect(unique.size).to.be.eq(3);
  });

  test("Test of mixed calls", async () => {
    await waitForAddressTxs(WALLET.address, WALLET.provider!);
    const unit = new MulticallContract(
      WALLET,
      {
        maxStaticCallsStack: 5,
        maxMutableCallsStack: 2,
        highPriorityTxs: true,
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 3; i++) {
      unit.add([i], storage.getFirstCall());
      unit.add([i, i], storage.getSecondCall());
    }
    unit.add(1, storage.setFirstCall(9));
    unit.add(2, storage.setSecondCall(9));
    const result = await unit.run();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.true;

    for (let i = 0; i < 3; i++) {
      expect(unit.getSingle([i])).to.be.eq(9n);
      expect(unit.getSingle([i, i])).to.be.eq(9n);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(unit.getSingle(1)).to.be.undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(unit.getSingle(2)).to.be.undefined;
    expect(unit.getRaw(1)).to.be.instanceOf(TransactionReceipt);
    expect(unit.getRaw(2)).to.be.instanceOf(TransactionReceipt);
  });

  test("Read data", async () => {
    const unit = new MulticallContract(
      WALLET,
      {
        maxStaticCallsStack: 2,
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 1; i++) {
      unit.add([i], storage.getFirstCall());
      unit.add([i, i], storage.getSecondCall());
    }
    const result = await unit.run();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.true;

    for (let i = 0; i < 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i])).to.be.true;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(unit.isSuccess([i, i])).to.be.true;
      const first = unit.getSingle([i]);
      const second = unit.getSingle([i, i]);
      expect(first).to.be.eq(9n);
      expect(second).to.be.eq(9n);
    }
  });

  // Sync operations are too fast
  test("Read data - timeout", async () => {
    const unit = new MulticallContract(
      WALLET,
      {
        staticCallsTimeoutMs: 1,
        maxStaticCallsStack: 1,
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 1; i++) {
      unit.add([i], storage.getFirstCall());
      unit.add([i, i], storage.getSecondCall());
    }
    let error;

    try {
      await unit.run();
    } catch (err) {
      error = err;
    }

    expect(error).to.be.match(new RegExp(/aborted/));
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(unit.success).to.be.false;
  });

  test("Read data - signal", async () => {
    const controller = new AsyncAbortController();

    const unit = new MulticallContract(
      WALLET,
      {
        highPriorityTxs: true,
        signals: [controller.signal],
        maxStaticCallsStack: 2,
      },
      MULTICALL_ADDRESS,
    );

    for (let i = 0; i < 1; i++) {
      unit.add([i], storage.getFirstCall());
      unit.add([i, i], storage.getSecondCall());
    }

    let error;
    try {
      controller.abort();
      await unit.run();
    } catch (err) {
      error = err;
    }
    expect(error).to.be.match(new RegExp(/aborted/));
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(unit.success).to.be.false;
  });
});
