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


  const fetchContractBalance = async () => {
    setLoading(true);
    try {
      if (walletProvider) {
        // lấy balance của contract
        const provider = walletProvider as Eip1193Provider;
        const ethersProvider = new BrowserProvider(provider);
        const contractBalance = await ethersProvider.getBalance(contracAddress);
        setCrownfundingBal(formatEther(contractBalance));

        // lấy số người đã đóng góp
        const contract = new Contract(contracAddress, contractABI, ethersProvider);
        const funderLength = await contract.getFundersLength();
        setFunderLength(funderLength);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }


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
      </MainLayout>
    </>
  );
}

export default App
