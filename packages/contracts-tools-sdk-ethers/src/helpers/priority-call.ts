import type { Contract, FeeData, Provider, Signer } from "ethers";
import { config } from "../config";
import type { PriorityCallOptions } from "../types";
import { checkSignals, createTimeoutSignal } from "../utils";

export async function priorityCall(
  provider: Provider,
  signer: Signer,
  contract: Contract,
  method: string,
  args: any[] = [],
  options: PriorityCallOptions = {},
): Promise<any> {
  const txn = await formTx(provider, signer, contract, method, args, options);

  return signer.sendTransaction(txn);
}

export async function priorityCallEstimate(
  provider: Provider,
  signer: Signer,
  contract: Contract,
  method: string,
  args: any[] = [],
  options: PriorityCallOptions = {},
) {
  const txn = await formTx(provider, signer, contract, method, args, options);

  return signer.estimateGas(txn);
}

async function formTx(
  provider: Provider,
  signer: Signer,
  contract: Contract,
  method: string,
  args: any[] = [],
  options: PriorityCallOptions = {},
) {
  const localOptions = {
    multiplier: config.priorityCalls.multiplier,
    ...options,
  };

  const localSignals: AbortSignal[] = [];
  if (localOptions.signals) localSignals.push(...localOptions.signals);
  if (localOptions.timeoutMs)
    localSignals.push(createTimeoutSignal(localOptions.timeoutMs));

  checkSignals(localSignals);
  const [originalFeeData, originalGasLimit] = await gatherOriginalData(
    provider,
    contract,
    method,
    args,
    localOptions.asynchronous ?? false,
    localSignals,
  );

  const maxFeePerGas = Math.ceil(
    localOptions.multiplier * Number(originalFeeData.maxFeePerGas),
  );
  const maxPriorityFeePerGas = Math.ceil(
    localOptions.multiplier * Number(originalFeeData.maxPriorityFeePerGas),
  );

  const gasLimit = Math.ceil(
    localOptions.multiplier * Number(originalGasLimit),
  );
  checkSignals(localSignals);

  const txn = await contract.getFunction(method).populateTransaction(...args, {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  // Prevents conflicts when using signer.sendTransaction(txn), as the signer should determine the from address.
  // Avoids potential issues if from is incorrectly set or differs from the signer's address.
  delete txn.from;

  if (localOptions.provideChainId) {
    checkSignals(localSignals);
    const network = await provider.getNetwork();
    txn.chainId = network.chainId;
  } else {
    if (localOptions.chainId) txn.chainId = localOptions.chainId;
  }

  return txn;
}

async function gatherOriginalData(
  provider: Provider,
  contract: Contract,
  method: string,
  args: any[] = [],
  asynchronous: boolean,
  signals: AbortSignal[],
): Promise<[FeeData, bigint]> {
  let originalFeeData: FeeData;
  let originalGasLimit: bigint;

  checkSignals(signals);

  if (asynchronous) {
    [originalFeeData, originalGasLimit] = await Promise.all([
      provider.getFeeData(),
      contract.getFunction(method).estimateGas(...args),
    ]);
    return [originalFeeData, originalGasLimit];
  }

  originalFeeData = await provider.getFeeData();
  checkSignals(signals);
  originalGasLimit = await contract.getFunction(method).estimateGas(...args);

  return [originalFeeData, originalGasLimit];
}
