import Card from "./Card"
import type { Eip1193Provider } from "ethers";
import { BrowserProvider, parseEther } from "ethers";
import { Contract } from "ethers";
import { contracAddress, contractABI } from "../contract/contractData";
import Button from "./Button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { shortenAddress } from "../lib/ultils";
import type { TransactionReceipt } from "ethers";
import type { TransactionResponse } from "ethers";

interface FundCardProps {
    amountFund: number,
    setAmoundFund: (v: number) => void,
    walletProvider: unknown,
    setCrownfundingBal: (v: string) => void,
    setFunderLength: (v: number) => void,
    fetchContractBalance: () => void,
}

const FundCard = ({ amountFund, setAmoundFund, walletProvider, setCrownfundingBal, setFunderLength, fetchContractBalance }: FundCardProps) => {

    const [isLoading, setLoading] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const onInputAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmoundFund(Number(e.target.value));
    }

    const handleFundToCrownFunding = async () => {
        setLoading(true);
        try {
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
                const tx: TransactionResponse = await contract.fund({ value: parseEther(amountFund.toString()) });
                setTxHash(tx.hash);
                await tx.wait();
                fetchContractBalance();

            }
        } catch (error) {
            alert("Donate thất bại rồi!");
            return;
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {
                !isLoading && (
                    <Card className='w-[70%] h-full px-10'>
                        <h2 className='text-lg font-semibold'>Donate your ethers</h2>
                        <input
                            placeholder='0.0'
                            className='border p-2 rounded-lg '
                            type='number'
                            onChange={onInputAmountChange}
                        />

                        <Button className="w-fit mt-10" onClick={() => handleFundToCrownFunding()} >
                            Donate
                        </Button>
                    </Card >
                )
            }
            {
                isLoading && (
                    <div>
                        <div className="flex items-center gap-3">
                            <LoaderCircle className='animate-spin' />
                            <p>Transaction đang được thực hiện</p>
                        </div>
                        <div>
                            {
                                txHash && <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="hover:underline">
                                    Transaction Hash: {shortenAddress(txHash)}
                                </a>
                            }
                        </div>
                    </div >
                )
            }

        </>
    )
}

export default FundCard
