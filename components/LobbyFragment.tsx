import Image from "next/image"
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import DraftingFragment from "./DraftingFragment";
import DraftingWaitingFragment from "./DraftingWaitingFragment";
import BanningFragment from "./BanningFragment";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";
import { useRouter } from "next/navigation";

interface BattleInfo {
    battleId: string,
    status: number,
    phase: number,
    createdBy: string,
    startedAt: number,
    endedAt: number,
    client1: ClientInfo,
    client2: ClientInfo
}

interface ClientInfo {
    address: string,
    status: number,
    hasAxiesDrafted: boolean,
    isBanTurn: boolean,
    timeBank: number,
    axies: string[],
    bannedAxies: string[],
}
//const socket = io(`ws://${process.env.NEXT_PUBLIC_WS}`);

export default function LobbyFragment({ params }: { params: { socket: Socket, battleId: string } }) {
    const router = useRouter();

    var [progress, setProgress] = useState<number>(0);

    const [clientAddress, setClient_address] = useState<string | any>(getUserAddressToLocal());
    const [client2Address, setClient2_address] = useState<string>("");

    const [hasAxiesDrafted, setHasAxiesDrafted] = useState<boolean>(false);
    const [hasBothClientDrafted, setHasBothClientDrafted] = useState<boolean>();

    params.socket.on('resultBattleInfo', (battleId, status, data: BattleInfo) => {
        setProgress(data.phase);

        //Check if this client is client1 in the server
        if (data.client1.address == clientAddress) {
            setClient_address(data.client1.address);
            setClient2_address(data.client2.address);

            //Set this client drafting status and turn on waiting screen
            setHasAxiesDrafted(data.client1.hasAxiesDrafted);

            //Checks if this use has to wait for the other one
            if (data.client1.hasAxiesDrafted && data.client2.hasAxiesDrafted) {
                setHasBothClientDrafted(true);
            }
        }

        //Check if this client is client2 in the server
        if (data.client2.address == clientAddress) {
            setClient_address(data.client2.address);
            setClient2_address(data.client1.address);

            //Set this client drafting status and turn on waiting screen
            setHasAxiesDrafted(data.client2.hasAxiesDrafted);

            //Checks if this use has to wait for the other one
            if (data.client1.hasAxiesDrafted && data.client2.hasAxiesDrafted) {
                setHasBothClientDrafted(true);
            }
        }
    })

    params.socket.on('disconnected', ()=>{
        router.refresh();
    })

    useEffect(() => {
        console.log("Connected to battle lobby")
        requestBattleInfo();
    }, [])

    function delay(milliseconds: number): any {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function requestBattleInfo() {
        console.log("Battle Request submitted: drafting")
        params.socket.emit('battleInfo', params.battleId, clientAddress)
    }

    return (
        <div className="w-full h-screen flex flex-col justify-normal items-center overflow-hidden">
            <div className="hidden w-full h-fit flex flex-row justify-end items-center">
                <div className="w-fit h-[40px] bg-blue-600 rounded-lg text-white overflow-x-hidden p-2 m-5">
                    <p className="min-w-[200px] max-w-[250px] text-ellipsis overflow-hidden">{client2Address}</p>
                </div>
            </div>
            <div className="w-full h-full 2xl:w-[1536px] mt-5">
                <div className="flex flex-row justify-center items-center mb-5">
                    <div className="w-fit mr-5">
                        <p>Battle Phase</p>
                    </div>
                    <div className="min-w-[200px] flex flex-row items-center">
                        <Image src={"/icons/free.png"} height={40} width={40} alt={""} unoptimized={true} />
                        <div className="flex flex-col justify-start ml-5">
                            <p>Axie Drafting</p>
                            <div className={`w-full mt-1 p-1  ${(progress == 0) ? 'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`} />
                        </div>
                    </div>
                    <div className="min-w-[200px] flex flex-row items-center">
                        <Image src={"/icons/banned.png"} height={40} width={40} alt={""} unoptimized={true} />
                        <div className="flex flex-col justify-start ml-5">
                            <p>Banning Phase</p>
                            <div className={`w-full mt-1  p-1  ${(progress == 1) ? 'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`} />
                        </div>
                    </div>
                </div>
                <div>
                    {
                        (progress == 0 && !hasAxiesDrafted)
                            ?
                            <DraftingFragment params={{ socket: params.socket, battleId: params.battleId, address: clientAddress, client2_address: client2Address }} />
                            :
                            (progress == 0 && hasAxiesDrafted || !(progress == 1 && hasBothClientDrafted))
                                ?
                                <DraftingWaitingFragment />
                                :
                                <BanningFragment params={{ socket: params.socket, battleId: params.battleId, address: clientAddress, client2_address: client2Address }} />
                    }
                </div>
            </div>
        </div>
    )
}