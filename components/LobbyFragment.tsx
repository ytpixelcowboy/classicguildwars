import Image from "next/image"
import { io, Socket } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";
import DraftingFragment from "./DraftingFragment";
import DraftingWaitingFragment from "./DraftingWaitingFragment";
import BanningFragment from "./BanningFragment";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";
import { useRouter } from "next/navigation";
import PreBanningFragment from "./PreBanningFragment";

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

export default function LobbyFragment({ params }: { params: { socket: Socket, address : string, battleId: string } }) {
    const router = useRouter();

    var [progress, setProgress] = useState<number>(0);

    const [clientAddress, setClient_address] = useState<string | any>(getUserAddressToLocal());
    const [client2Address, setClient2_address] = useState<string>("");

    const [hasAxiesDrafted, setHasAxiesDrafted] = useState<boolean>(false);
    const [hasBothClientDrafted, setHasBothClientDrafted] = useState<boolean>();

    const [banningClient, setBanningClient] = useState<string>("");
    const [banAxieCount,setBanAxieCount] = useState<number>(0);
    const [banningTime, setBanningTime] = useState<number>(0);
    const [banningTimeType, setBanningTimeType] = useState<number>(0);

    const [turnNumber, setTurnNumber] = useState<number>(0);

    const [showTurnAnnouncer, setShowTurnAnnouncer] = useState<boolean>(false);

    useMemo(() => {
        requestBattleInfo();
        
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

        params.socket.on('initiateBan', (turnNumber: number, banningClient : string, banCount : number, timelimit : number, bufferTime : number)=>{
            setBanningClient(banningClient);
            setBanAxieCount(banCount);
            setTurnNumber(turnNumber);
        })

        params.socket.on('timeLeft', (seconds : number, type : number)=>{
            setBanningTime(seconds);
            setBanningTimeType(type);
        })
    }, [])

    useMemo(()=>{
        // Hide the announcement after 3 seconds
        if(progress == 2){
            setShowTurnAnnouncer(true);
        }
        

        const timeout = setTimeout(() => {
            setShowTurnAnnouncer(false);
            clearTimeout(timeout);
        }, 5000);
        
    },[turnNumber])

    function delay(milliseconds: number): any {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function requestBattleInfo() {
        console.log("Battle Request submitted: drafting")
        params.socket.emit('battleInfo', params.battleId, clientAddress)
    }

    return (
        <div className="w-full min-h-screen flex flex-col justify-normal items-center">
            <div className={`fixed h-screen flex flex-col justify-center items-center left-1/2 transform -translate-x-1/2  transition-all ${showTurnAnnouncer ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-10 -z-30'}`}>
                <div className="min-w-[400px] min-h-[200px] flex flex-col justify-center items-center bg-bg border-fg-shadow border-4 text-white p-24 rounded-lg shadow-2xl  ">
                    <p className="text-white font-bold text-4xl">{`Turn ${turnNumber}`}</p>
                    <div className="w-full h-fit mt-10 flex flex-col justify-normal items-center">
                        <p className="text-white text-sm">Banning Guild</p>
                        <p className="text-white text-base">{banningClient}</p>
                    </div>
                </div>
            </div>
            <div className="w-full min-h-screen 2xl:w-[1536px] flex flex-col justify-normal items-center">
                <div className="w-full h-[60px] flex flex-row justify-between items-center shadow-sm fixed px-5">
                    <div className="w-full">
                        <div className={`w-fit flex flex-row justify-normal items-start bg-item-bd  border-x-fg-shadow border-b-fg-shadow border-t-bg border-2 rounded-md py-2 ${(progress == 2) ? 'visible' : 'hidden'}`}>
                            <div className="min-w-[60px] flex flex-col justify-normal items-center px-5">
                                <p className="text-white text-sm">Turn</p>
                                <p className="text-white text-2xl font-bold">{turnNumber}</p>
                            </div>
                            <div className="w-[3px] h-[50px] bg-slate-500 rounded-lg"/>
                            <div className="min-w-[100px] flex flex-col justify-center items-center px-5">
                                <p className="h-fit text-sm text-white">{(banningTimeType == 0) ? "Time Left" : "Buffer Time"}</p>
                                <div className="h-fit flex flex-row justify-center items-center">
                                    <Image src={"/icons/icon-time.png"} className="mr-2" height={15} width={15} alt={""} unoptimized={true} />
                                    <p className="text-base text-white">{`${banningTime} s`}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-row justify-center items-center">
                        <div className="h-[60px] flex flex-col justify-center items-center bg-item-bd border-x-fg-shadow border-b-fg-shadow border-t-bg border-2 p-3 rounded-b-lg">
                            <div className="w-fit mr-5 hidden">
                                <p className="text-xs">Battle Phase</p>
                            </div>
                            <div className="w-fit flex flex-row justify-center items-center">
                                <div className="min-w-[200px] flex flex-row justify-center items-center">
                                    <Image src={"/icons/free.png"} height={35} width={35} alt={""} unoptimized={true} />
                                    <div className="flex flex-col justify-start ml-5">
                                        <p className="text-sm text-white">Axie Drafting</p>
                                        <div className={`w-full mt-1 p-1  ${(progress == 0) ? 'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`} />
                                    </div>
                                </div>
                                <div className="min-w-[200px] flex flex-row justify-center items-center">
                                    <Image src={"/icons/banned.png"} height={35} width={35} alt={""} unoptimized={true} />
                                    <div className="flex flex-col justify-start ml-5">
                                        <p className="text-sm text-white">Banning Phase</p>
                                        <div className={`w-full mt-1  p-1  ${(progress > 1) ? 'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-row justify-end items-center">
                        <div className="w-[200px] h-[40px] flex flex-row justify-normal items-center bg-blue-600 rounded-lg text-white overflow-x-hidden p-2">
                            <Image src={"/icons/ic_blockchain.png"} className="mr-2" height={15} width={15} alt={""} unoptimized={true} />
                            <p className="w-[160px] text-sm text-ellipsis overflow-hidden">{clientAddress}</p>
                        </div>
                    </div>
                </div>

                <div className="w-full min-h-screen mt-[60px] flex flex-col justify-center items-center p-5">
                    {
                        (progress == 0 && !hasAxiesDrafted)
                            ?
                            <DraftingFragment params={{ socket: params.socket, battleId: params.battleId, address: clientAddress, client2_address: client2Address }} />
                            :
                            (progress == 0 && hasAxiesDrafted)
                                ?
                                <DraftingWaitingFragment />
                                :
                                (progress == 1 && hasBothClientDrafted)
                                ?
                                <PreBanningFragment params={{ socket: params.socket, battleId: params.battleId, address: clientAddress, client2_address: client2Address }}/>
                                :
                                <BanningFragment params={{ socket: params.socket, battleId: params.battleId, address: clientAddress, client2_address: client2Address }} />
                    }
                </div>
            </div>
        </div>
    )
}