import { useAppKit, useAppKitAccount, } from "@reown/appkit/react";
import { shortenAddress } from "../../../lib/ultils";
import { ExternalLink } from "lucide-react";
import { contracAddress } from "../../../contract/contractData";
import Button from "../../../components/Button";

const Header = () => {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();

    return (
        <>
            <header className='py-2'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-xl font-bold'>CROWFUNDING</h1>
                        <a href={`https://sepolia.etherscan.io/address/${contracAddress}`} className='text-sm hover:bg-gray-200 p-1 rounded-lg flex items-center gap-1' target='_blank'>{shortenAddress(contracAddress)} <ExternalLink />
                        </a>
                    </div>
                    {isConnected ? (
                        <Button className='gap-2' onClick={() => open({ view: "Account" })}>
                            {shortenAddress(address, 4)}
                        </Button>

                    ) : (
                        <Button onClick={() => open({ view: "Connect" })}>
                            Connect wallet
                        </Button>
                    )}
                </div>

            </header>
        </>
    )
}

export default Header;