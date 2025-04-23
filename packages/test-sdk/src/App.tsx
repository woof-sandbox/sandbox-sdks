import { ConnectButton } from "@rainbow-me/rainbowkit";

import { arbitrum, sepolia } from "@wagmi/core/chains";
import { useEffect, useState } from "react";
import {
  useAccount,
  useTransactionReceipt,
  useWaitForTransactionReceipt,
} from "wagmi";
import { config } from "./web3/wagmi";

import { SandboxController, UserMarket } from "@woof-software/comet-sdk-wagmi";
import type { WagmiChainId } from "@woof-software/comet-sdk-wagmi/lib";

const marketsArbitrum = [
  {
    address: "0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07",
    name: "USDT",
  },
  {
    address: "0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486",
    name: "WETH",
  },
  {
    address: "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
    name: "USDC",
  },
  {
    address: "0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA",
    name: "USDC.e",
  },
];

function App() {
  const { address } = useAccount();

  const [selectedAddress, setSelectedAddress] = useState<string>(
    marketsArbitrum[0].address,
  );

  const [currentMarket, setCurrentMarket] = useState<any>(null);
  const [currentConfigController, setConfigController] = useState<any>(null);
  const [currentSandBoxController, setSandBoxController] = useState<any>(null);

  const [viewError, setViewError] = useState<any>(null);

  const [transactionHash, setTransactionHash] = useState<`0x${string}`>();

  const { isLoading: isLoadingTransactionReceipt } = useTransactionReceipt({
    hash: transactionHash,
  });
  const {
    isLoading: isLoadingWaitForTransactionReceipt,
    isSuccess: isSuccessToken,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const isAbsoluteLoading =
    isLoadingTransactionReceipt || isLoadingWaitForTransactionReceipt;

  const handleGetUserMarket = async () => {
    if (!address) {
      return;
    }
    try {
      const market = await UserMarket.fetchUserMarket(
        selectedAddress as `0x${string}`,
        address,
        arbitrum.id as WagmiChainId,
        config,
      );
      setCurrentMarket(market);
      console.log("Market data:", market);
    } catch (error) {
      console.error("Error fetching market:", error);
      setViewError(error);
    }
  };

  const handleChangeMarket = (address: string) => {
    setSelectedAddress(address);
  };

  useEffect(() => {
    if (!address) {
      setCurrentMarket(null);
    }
  }, [address]);

  const handleFunction = async (fn?: () => Promise<any>) => {
    if (!fn) return;

    try {
      const result = await fn();

      setTransactionHash(result);
    } catch (error: any) {
      const message = error?.message || "Something went wrong";
      setViewError(message);
    }
  };

  const handleGetConfigControllerData = async () => {
    // try {
    //   const conf = await ConfigController.fetch(
    //     '0xDF539a3B60172779Be6cBa11B26bBE0913b5316A',
    //     sepolia.id,
    //     config
    //   );
    //   setConfigController(conf);
    //   console.log('configC data:', conf);
    // } catch (error) {
    //   console.error('Error fetching configC:', error);
    //   setViewError(error);
    // }
  };

  const handleGetSandBoxControllerData = async () => {
    try {
      const sandboxController = await SandboxController.fetch(
        "0xaf39746D87b067267B23C2169BF727F237f303b9",
        sepolia.id,
        config,
      );
      setSandBoxController(sandboxController);
      console.log("sandboxController data:", sandboxController);
    } catch (error) {
      console.error("Error fetching sandboxController:", error);
      setViewError(error);
    }
  };

  return (
    <>
      <div
        style={{
          color: "#000",
          display: "flex",
          gap: "20px",
          flexDirection: "column",
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Markets Data</h1>
          <ConnectButton />
        </header>

        {!address && <h2>Connect Wallet</h2>}

        <div style={{ display: "flex", gap: "10px" }}>
          {address && (
            <button onClick={handleGetUserMarket}>get User Market Data</button>
          )}

          {address && (
            <button onClick={handleGetConfigControllerData}>
              get Config Controller Data
            </button>
          )}
          {address && (
            <button onClick={handleGetSandBoxControllerData}>
              get SandBox Controller Data
            </button>
          )}

          <select onChange={(e) => handleChangeMarket(e.target.value)}>
            {marketsArbitrum.map((market) => (
              <option key={market.address} value={market.address}>
                {market.name}
              </option>
            ))}
          </select>
        </div>

        {viewError && (
          <div
            style={{
              border: "1px solid #ffaaaa",
              padding: "10px",
              borderRadius: "20px",
            }}
          >
            <h2>Error Area</h2>
            <p>{viewError}</p>
            <button onClick={() => setViewError(null)}>Clear error</button>
          </div>
        )}

        {isAbsoluteLoading && (
          <div
            style={{
              border: "1px solid #FFFF00",
              padding: "10px",
              borderRadius: "20px",
            }}
          >
            <h2>Loading...</h2>
          </div>
        )}

        {isSuccessToken && (
          <div
            style={{
              border: "1px solid #008000",
              padding: "10px",
              borderRadius: "20px",
            }}
          >
            <h2>Successful...</h2>
          </div>
        )}

        {currentMarket && (
          <div style={{ display: "flex", gap: "10px" }}>
            <table>
              <thead>
                <tr>
                  <th>Comet Address</th>
                  <th>Base Token Balance</th>
                  <th>Supply Balance</th>
                  <th>Borrow Balance</th>
                  <th>Total Borrow</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{currentMarket?.cometAddress}</th>
                  <th>{currentMarket?.baseTokenBalance}</th>
                  <th>{currentMarket?.supplyBalance}</th>
                  <th>{currentMarket?.borrowBalance}</th>
                  <th>{currentMarket?.totalBorrow}</th>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              <button
                onClick={() =>
                  handleFunction(() => currentMarket?.supplyMarket("0.01"))
                }
              >
                supply market 0.01
              </button>
              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.approveMarketBaseToken("0.01"),
                  )
                }
              >
                approve market base asset 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() => currentMarket?.allowMarket())
                }
              >
                allow market
              </button>

              <button
                onClick={() =>
                  handleFunction(() => currentMarket?.borrowMarket("0.01"))
                }
              >
                borrow market 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.withDrawMarket("0.01", false),
                  )
                }
              >
                withdraw market 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.borrowAndSupplyMarket(
                      "0.01",
                      [
                        {
                          inputAmount: "0.5",
                          tokenAddress:
                            "0x912ce59144191c1204e64559fe8253a0e49e6548",
                        },
                      ],
                      arbitrum.id,
                    ),
                  )
                }
              >
                borrow and supply collateral ARB 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.approveToken(
                      "0x912ce59144191c1204e64559fe8253a0e49e6548",
                      "0.01",
                      18,
                    ),
                  )
                }
              >
                approve collateral ARB 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.supplyCollaterals(
                      [
                        {
                          tokenAddress:
                            "0x912ce59144191c1204e64559fe8253a0e49e6548",
                          inputAmount: "0.01",
                        },
                      ],
                      arbitrum.id,
                    ),
                  )
                }
              >
                supply collateral ARB 0.01
              </button>
              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.withDrawCollateral([
                      {
                        tokenAddress:
                          "0x912ce59144191c1204e64559fe8253a0e49e6548",
                        inputAmount: "0.01",
                      },
                    ]),
                  )
                }
              >
                withdraw collateral ARB 0.01
              </button>
            </div>
          </div>
        )}
      </div>
      {currentConfigController && (
        <div>
          <h2>Config Controller</h2>

          <div
            style={{
              display: "grid",
              gap: "10px",
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            <button
              onClick={() =>
                handleFunction(() =>
                  currentConfigController?.proposeCurator(address),
                )
              }
            >
              propose curator ${address}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
