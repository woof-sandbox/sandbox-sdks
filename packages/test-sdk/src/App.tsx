import { ConnectButton } from "@rainbow-me/rainbowkit";

import { sepolia } from "@wagmi/core/chains";
import { useEffect, useState } from "react";
import {
  useAccount,
  useTransactionReceipt,
  useWaitForTransactionReceipt,
} from "wagmi";
import { config } from "./web3/wagmi";

import { SandboxController, UserMarket } from "@woof-software/comet-sdk-wagmi";
import type { WagmiChainId } from "@woof-software/comet-sdk-wagmi/lib";
import { parseUnits } from "viem";

// const marketsArbitrum = [
//   {
//     address: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07',
//     name: 'USDT',
//   },
//   {
//     address: '0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486',
//     name: 'WETH',
//   },
//   {
//     address: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
//     name: 'USDC',
//   },
//   {
//     address: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
//     name: 'USDC.e',
//   },
// ];
const marketsSepolia = [
  {
    address: "0xaCb1C4D4de3ce962673326fb9c53d56ce4881cf4",
    name: "BaseSep",
  },
  // {
  //   address: '0x14bc5e66ff4e49d18bff96c11d72a894df285e5f',
  //   name: 'second',
  // },
  // {
  //   address: '0xdC502E9bad9396b4d3916b4510460C49449D75F5',
  //   name: 'old one',
  // },
];

function App() {
  const { address } = useAccount();

  const [selectedAddress, setSelectedAddress] = useState<string>(
    marketsSepolia[0].address,
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
      // const markets123 = await Market.fetchMarkets(
      //   {
      //     [sepolia.id]: [
      //       '0xdC502E9bad9396b4d3916b4510460C49449D75F5',
      //       '0x82478f6d1dc4d64f4678f55360d5d1a05628059b',
      //     ],
      //   },
      //   config
      // );

      const market = await UserMarket.fetchUserMarket(
        selectedAddress as `0x${string}`,
        address,
        sepolia.id as WagmiChainId,
        config,
      );
      // arbitrum.id as WagmiChainId,
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

      console.log("result--", result);
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
            {marketsSepolia.map((market) => (
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
                  <th>Custom APR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{currentMarket?.cometAddress}</th>
                  <th>{currentMarket?.baseTokenBalance}</th>
                  <th>{currentMarket?.supplyBalance}</th>
                  <th>{currentMarket?.borrowBalance}</th>
                  <th>{currentMarket?.totalBorrow}</th>
                  <th>{currentMarket?.earnAprCustom("100000000")}</th>
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
                  handleFunction(() =>
                    currentMarket?.createAction([
                      {
                        address: "0x306134121e8B55dfA9faBA05De590E639a1F7D6B",
                        value: "100",
                        action: "withdraw-base",
                        // isNative: true,
                        isMax: true,
                      },
                      // {
                      //   address: '0xb01f67f936b018edf565311A0ab55F3e1A05dBaf',
                      //   value: '0.01',
                      //   action: 'supply',
                      //   // isMax: true,
                      // },
                      // {
                      //   address: '0x306134121e8B55dfA9faBA05De590E639a1F7D6B',
                      //   value: '101.072573',
                      //   action: 'repay',
                      //   // isNative: true,
                      //   isMax: true,
                      // },

                      // {
                      //   address: '0xb01f67f936b018edf565311A0ab55F3e1A05dBaf',
                      //   value: '0.001',
                      //   action: 'withdraw',
                      // },
                      // {
                      //   address: '0xA512C74c637108FD1Cae88163176480452B1Fb8E',
                      //   value: '10',
                      //   action: 'borrow',
                      // },
                      // {
                      //   address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                      //   value: '0.4',
                      //   action: 'repay',
                      // },
                      // {
                      //   address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                      //   value: '1',
                      //   action: 'borrow',
                      // },
                    ]),
                  )
                }
              >
                call custom action
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.approveViaSignature(
                      "0x619Cd39439791D6B4f55F6eDf2a3b52bd6f30c22",
                    ),
                  )
                }
              >
                allow market sign
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.getBulkerTokensAllowed(
                      "0x619Cd39439791D6B4f55F6eDf2a3b52bd6f30c22",
                      [
                        {
                          tokenAddress: currentMarket.baseToken.tokenAddress,
                          inputAmount: parseUnits(
                            "100",
                            Number(currentMarket.baseToken.decimals),
                          ),
                        },
                      ],
                    ),
                  )
                }
              >
                is Allowed Base token
              </button>

              <button
                onClick={() =>
                  handleFunction(() => currentMarket?.getBulkerAllowed(address))
                }
              >
                is Allowed
              </button>

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
                    currentMarket?.supplyMarket("0.00000038307", true),
                  )
                }
              >
                supply base token 0.00000038307
              </button>
              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.approveMarketBaseToken("100"),
                  )
                }
              >
                approve market base asset 100
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
                    currentMarket?.withdrawMarket("0.01", false),
                  )
                }
              >
                withdraw market 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.withdrawMarket(
                      "0.000200000229887368",
                      false,
                      true,
                    ),
                  )
                }
              >
                withdraw market in Native 0.000200000229887368
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.supplyMarket("0.000071161671297822", true),
                  )
                }
              >
                repay market in Native 0.000071161671297822
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.borrowAndSupplyMarket(
                      "0.5",
                      [
                        {
                          tokenAddress:
                            "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
                          inputAmount: "0.0003",
                          isNative: true,
                        },
                        {
                          tokenAddress:
                            "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
                          inputAmount: "0.0002",
                          isNative: false,
                        },
                      ],
                      sepolia.id,
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
                      "0xb01f67f936b018edf565311A0ab55F3e1A05dBaf",
                      "0.01",
                      8,
                    ),
                  )
                }
              >
                approve collateral WBTC 0.01
              </button>

              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.supplyCollaterals(
                      [
                        {
                          tokenAddress:
                            "0x4F8037F0A814A191fBF03E7F31e77cc118F19A95",
                          inputAmount: "0.0001",
                          isNative: true,
                        },
                        // {
                        //   tokenAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                        //   inputAmount: '0.0001',
                        //   isNative: false,
                        // },
                      ],
                      sepolia.id,
                    ),
                  )
                }
              >
                supply collateral WETH 0.01
              </button>
              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.withdrawCollateral([
                      {
                        tokenAddress:
                          "0xb01f67f936b018edf565311A0ab55F3e1A05dBaf",
                        inputAmount: "0.001",
                      },
                    ]),
                  )
                }
              >
                withdraw collateral WBTC 0.001
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
