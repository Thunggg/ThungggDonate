import { useEffect, useState } from 'react'
import './index.css'
import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "@reown/appkit/networks";
import { shortenAddress } from './lib/ultils';
import { contracAddress, contractABI } from './contract/contractData';
import { ExternalLink } from 'lucide-react';
import { BrowserProvider, Contract, formatUnits } from "ethers";
import type { Eip1193Provider } from "ethers";
import { formatEther } from 'ethers';
import { parseEther } from 'ethers';

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
  const { open, close } = useAppKit();
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [crownfundingBal, setCrownfundingBal] = useState<string | null>(null);
  const [funderLength, setFunderLength] = useState<number | null>(null);
  const [amountFund, setAmoundFund] = useState<number | null>(null);

  const fetchContractBalance = async () => {
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
  }


  const handleFundToCrownFunding = async () => {
    if (amountFund == null || amountFund <= 0) {
      alert("Giá trị không hơp lệ!");
      return;
    }
    if (walletProvider) {
      // lấy balance của contract
      const provider = walletProvider as Eip1193Provider;
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contracAddress, contractABI, signer);
      const tx = await contract.fund({ value: parseEther(amountFund.toString()) });
      await tx.wait();
      fetchContractBalance();
    }
  }

  const onInputAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmoundFund(Number(e.target.value));
  }

  useEffect(() => {
    fetchContractBalance();
  }, []);

  return (
    <>
      <header className='py-2 px-2 container mx-auto'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <h1 className='text-xl font-bold'>CROWFUNDING</h1>
            <a href={`https://sepolia.etherscan.io/address/${contracAddress}`} className='text-sm hover:bg-gray-200 p-1 rounded-lg flex items-center gap-1' target='_blank'>{shortenAddress(contracAddress)} <ExternalLink />
            </a>
          </div>
          {isConnected ? (
            <button
              className='bg-slate-900 gap-2 text-white py-2 px-3 rounded-lg hover:bg-slate-800'
              onClick={() => open({ view: "Account" })}
            >
              {shortenAddress(address, 4)}
            </button>
          ) : (
            <button
              className='bg-slate-900 text-white py-2 px-3 rounded-lg hover:bg-slate-800'
              onClick={() => open({ view: "Connect" })}
            >
              Connect wallet
            </button>
          )}
        </div>

      </header>

      <main className='pt-4 container mx-auto px-2'>

        <div className='flex justify-start items-center'>

          <div className='space-y-2 w-[30%]'>
            <div className='px-2 py-4 shadow-lg  rounded-lg'>
              <h2 className='text-lg'>Total amount funding</h2>
              <span className='text-2xl font-bold'>{crownfundingBal} </span> <span>ETH</span>
            </div>
            <div className='px-2 py-4 shadow-lg  rounded-lg'>
              <h2 className='text-lg'>Funder</h2>
              <span className='text-2xl font-bold'>{funderLength}</span>
            </div>
          </div>


          <div className='w-[70%] px-2 py-4 ml-2  shadow-lg  rounded-lg'>
            <h2 className='text-lg font-semibold'>Donate your ethers</h2>
            <input
              placeholder='0.0'
              className='border p-2 rounded-lg '
              type='number'
              onChange={onInputAmountChange}
            />
            <button
              className='bg-slate-900 text-white py-2 px-3 rounded-lg hover:bg-slate-800'
              onClick={() => handleFundToCrownFunding()}
            >Donate</button>
          </div>
        </div>


      </main >
    </>
  );
}

export default App
