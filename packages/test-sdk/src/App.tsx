// @ts-ignore
import { UserMarketWrapper } from '@sandbox/comet-sdk-wagmi/wrapper/UserMarketWrapper';
import { arbitrum } from '@wagmi/core/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { config } from './web3/wagmi';

const marketsArbitrum = [
  {
    address: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07',
    name: 'USDT',
  },
  {
    address: '0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486',
    name: 'WETH',
  },
  {
    address: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
    name: 'USDC',
  },
  {
    address: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
    name: 'USDC.e',
  },
];

function App() {
  const { address } = useAccount();

  const [selectedAddress, setSelectedAddress] = useState<string>(marketsArbitrum[0].address);

  const [currentMarket, setCurrentMarket] = useState<any>(null);
  const [viewError, setViewError] = useState<any>(null);

  const handleGetUserMarket = async () => {
    try {
      const market = await UserMarketWrapper.fetch(selectedAddress, address, arbitrum.id, config);
      setCurrentMarket(market);
      console.log('Market data:', market);
    } catch (error) {
      console.error('Error fetching market:', error);
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

      console.log('--result--', result);
    } catch (error: any) {
      const message = error?.message || 'Something went wrong';
      console.error('--error--', message);
      setViewError(message);
    }
  };

  return (
    <>
      <div style={{ color: '#000', display: 'flex', gap: '20px', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Markets Data</h1>
          <ConnectButton />
        </header>

        {!address && <h2>Connect Wallet</h2>}

        <div style={{ display: 'flex', gap: '10px' }}>
          {address && <button onClick={handleGetUserMarket}>get User Market Data</button>}

          <select onChange={(e) => handleChangeMarket(e.target.value)}>
            {marketsArbitrum.map((market) => (
              <option
                key={market.address}
                value={market.address}
              >
                {market.name}
              </option>
            ))}
          </select>
        </div>

        {viewError && (
          <div style={{ border: '1px solid #ffaaaa', padding: '10px', borderRadius: '20px' }}>
            <h2>Error Area</h2>
            <p>{viewError}</p>
            <button onClick={() => setViewError(null)}>Clear error</button>
          </div>
        )}

        {currentMarket && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <table>
              <thead>
                <tr>
                  <th>Comet Address</th>
                  <th>Supply Balance</th>
                  <th>Borrow Balance</th>
                  <th>Total Borrow</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{currentMarket?.cometAddress}</th>
                  <th>{currentMarket?.supplyBalance}</th>
                  <th>{currentMarket?.borrowBalance}</th>
                  <th>{currentMarket?.totalBorrow}</th>
                  <th></th>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => handleFunction(() => currentMarket?.supplyMarket('0.01'))}>
                supply market 0.01
              </button>
              <button
                onClick={() =>
                  handleFunction(() =>
                    currentMarket?.approveToken(
                      currentMarket.baseToken.tokenAddress,
                      '0.01',
                      Number(currentMarket.baseToken.decimals)
                    )
                  )
                }
              >
                approve market base asset 0.01
              </button>

              <button onClick={() => handleFunction(() => currentMarket?.borrowMarket('0.01'))}>
                borrow market 0.01
              </button>

              <button
                onClick={() => handleFunction(() => currentMarket?.withDrawMarket('0.01', false))}
              >
                withdraw market 0.01
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
