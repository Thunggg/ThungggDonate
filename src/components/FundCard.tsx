import Card from "./Card"
import type { Eip1193Provider } from "ethers";
import { BrowserProvider, parseEther } from "ethers";
import { Contract } from "ethers";
import { contracAddress, contractABI } from "../contract/contractData";
import Button from "./Button";

interface FundCardProps {
    amountFund: number,
    setAmoundFund: (v: number) => void,
    walletProvider: unknown,
    setCrownfundingBal: (v: string) => void,
    setFunderLength: (v: number) => void,
    fetchContractBalance: () => void,
}

const FundCard = ({ amountFund, setAmoundFund, walletProvider, setCrownfundingBal, setFunderLength, fetchContractBalance }: FundCardProps) => {

    const onInputAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmoundFund(Number(e.target.value));
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

    return (
        <>
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
        </>
    )
}

export default FundCard
