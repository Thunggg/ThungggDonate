import { useEffect, useState } from 'react'
import './index.css'
import { createAppKit, useAppKitProvider } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "@reown/appkit/networks";
import { contracAddress, contractABI } from './contract/contractData';
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { formatEther } from 'ethers';
import { MainLayout } from './layouts/MainLayout';
import Card from './components/Card';
import FundCard from './components/FundCard';
import { LoaderCircle } from 'lucide-react';
import type { FundedEvent } from './lib/type';
import { shortenAddress } from './lib/ultils';
import { AlchemyProvider } from 'ethers';

// 1. Get projectId
const projectId = import.meta.env.VITE_WALLET_CONNECT_ID;

// 2. Set the networks
const networks: any = [sepolia];

// 3. Create a metadata object - optional
const metadata = {
  name: "Crounwfunding-interface",
  description: "My Website Help user using Crounwfunding",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

function App() {
  const { walletProvider } = useAppKitProvider("eip155");
  const [crownfundingBal, setCrownfundingBal] = useState<string | null>(null);
  const [funderLength, setFunderLength] = useState<number>(0);
  const [amountFund, setAmoundFund] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [historyEvent, setHistoryEvent] = useState<FundedEvent[] | null>(null);

  const fetchContractBalance = async () => {
    setLoading(true);
    try {
      let ethersProvider;

      // Xác định provider
      if (walletProvider) {
        const provider = walletProvider as Eip1193Provider;
        ethersProvider = new BrowserProvider(provider);

        // Lấy balance của contract (chỉ khi có walletProvider)
        const contractBalance = await ethersProvider.getBalance(contracAddress);
        setCrownfundingBal(formatEther(contractBalance));
      } else {
        ethersProvider = new AlchemyProvider("sepolia", import.meta.env.VITE_ETH_ALCHEMY_SEPOLIA_KEY);
        setCrownfundingBal(formatEther(await ethersProvider.getBalance(import.meta.env.VITE_CONTRACT_ADDRESS)))
      }

      // Xử lý chung cho cả hai trường hợp
      const contract = new Contract(contracAddress, contractABI, ethersProvider);
      await processContractData(contract);

    } catch (error) {
      // Xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý dữ liệu contract
  const processContractData = async (contract: Contract) => {
    // Lấy số người đóng góp
    const funderLength = await contract.getFundersLength();
    setFunderLength(funderLength);

    // Lấy lịch sử sự kiện
    const fundedFilter = contract.filters.Funded;
    const fundedEvents = await contract.queryFilter(fundedFilter, 10000);

    // Định dạng sự kiện
    const fundedEventsFormated: FundedEvent[] = fundedEvents.map(event => ({
      blockNumber: event.blockNumber,
      txHash: event.transactionHash,
      funder: (event as any).args[0],
      value: formatEther((event as any).args[1]),
    })).sort((a, b) => b.blockNumber - a.blockNumber);

    setHistoryEvent(fundedEventsFormated);
  };


  useEffect(() => {
    fetchContractBalance();
  }, [funderLength, crownfundingBal, walletProvider]);

  return (
    <>
      <MainLayout>
        <main>
          <div className='flex justify-start items-center pt-4'>

            <div className='space-y-2 w-[30%]'>
              <Card>
                <h2 className='text-lg'>Total amount funding</h2>
                {
                  isLoading && (
                    <LoaderCircle className='animate-spin' />
                  )
                }
                {
                  !isLoading && crownfundingBal && (
                    <span className='text-2xl font-bold'>{crownfundingBal} </span>
                  )
                }
                <span>ETH</span>

              </Card>

              <Card>
                <h2 className='text-lg'>Funder</h2>
                {
                  isLoading && (
                    <LoaderCircle className='animate-spin' />
                  )
                }
                {
                  !isLoading && crownfundingBal && (
                    <span className='text-2xl font-bold'>{funderLength}</span>
                  )
                }
              </Card>
            </div>


            <FundCard
              amountFund={amountFund}
              setAmoundFund={setAmoundFund}
              walletProvider={walletProvider}
              setCrownfundingBal={setCrownfundingBal}
              setFunderLength={setFunderLength}
              fetchContractBalance={fetchContractBalance}
            />



          </div>
        </main >
        <div className='mt-6 pt-4 space-y-2'>
          {
            isLoading && (
              <LoaderCircle className='animate-spin' />
            )
          }
          {
            !isLoading && historyEvent && historyEvent.length !== 0 &&
            historyEvent.map((items, index) => (
              <>
                <Card key={items.txHash} className='hover:shadow transition-all'>
                  <div className='flex justify-between'>
                    <div>
                      <p className='font-bold'>Funder:</p>
                      <a target="_blank" href={`https://sepolia.etherscan.io/address/${items.funder}`} className='hover:underline'>{shortenAddress(items.funder)}</a>
                    </div>

                    <div>
                      <p className='font-bold'>Value:</p>
                      <div>{items.value}</div>

                    </div>

                    <div>
                      <p className='font-bold'>TxHash:</p>
                      <a target="_blank" href={`https://sepolia.etherscan.io/tx/${items.txHash}`} className='hover:underline'>{shortenAddress(items.txHash)}</a>

                    </div>
                  </div>
                </Card>

              </>
            ))

          }
        </div>
      </MainLayout>
    </>
  );
}

export default App
