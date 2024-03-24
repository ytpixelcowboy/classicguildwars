'use client'

import fetchLiveBattles from "@/scripts/getLiveBattles";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";
import Image from "next/image"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DefaultMediumModal from "@/modals/DefaultMediumModal";
import CreateBattleRoom from "@/modals/CreateBattleRoom";
import { io } from "socket.io-client";

interface SocketResponse {
    intent: string,
    msg?: string,
    status?: number,
    battleId: string,
    userId: string,
    data?: LiveBatles[],
}

interface LiveBatles{
    battleId : string,
    status : number,
    phase : number,
    createdBy: string,
    startedAt : number,
    endedAt : number,
    client1 : BattleClient,
    client2 : BattleClient
}

interface BattleClient{
    address: string,
    status: number,
    isBanTurn: boolean,
    timeBank: number,
    axies: string[],
    bannedAxies: BannedAxiesModel[],
}

interface BannedAxiesModel{
    axieId : string,
    isBanned : string,
}
const socket = io(`ws://${process.env.NEXT_PUBLIC_WS}`);

export default function AdminDashboard(){
    const router = useRouter();

    const [isConnected , setConnectionStatus] = useState<boolean>(false);
    const [liveBattles, setLiveBattles] = useState<LiveBatles[]>();

    useEffect(()=>{
        console.log(liveBattles)
    }, [liveBattles]);

    useEffect(()=>{
        fetchLiveBattles().then(setLiveBattles)
    },[])

    const ref_createBattle = useRef<HTMLDialogElement>(null);
    const open_createBattle = ()=>ref_createBattle.current?.showModal();
    const close_createBattle = ()=>ref_createBattle.current?.close();

    useEffect(()=>{
        socket.on('connected', ()=>{
            console.log("Admin dashboard connected")
        })
    },[])

    return (
        <main className="h-screen flex flex-row justify-normal bg-gradient-radial from-bg-sub to-fg-shadow">
            <CreateBattleRoom ref={ref_createBattle} onClose={close_createBattle} callback={(client1Address, client2Address) => {
                socket.emit('createBattle', "0x3277d86718041a38c1605dd6d13039edb1722e6e", client1Address, client2Address, (callback: string) => {
                    console.log("Room has been created");
                    close_createBattle();
                })
            }} />

            <div className="w-[400px] h-screen bg-fg-item p-5 flex flex-col rounded-md justify-between shadow-2xl">
                <div className="flex flex-row justify-normal items-center">
                    <Image src={"/icons/icon_guild.png"} height={50} width={50} alt={""} unoptimized={true} />
                    <p className="text-2xl font-bold text-white ml-5">Guild Wars</p>
                </div>
                <div className="flex flex-row justify-center items-center">
                    
                </div>
            </div>
            <div className="w-full min-h-screen flex flex-row justify-between p-2 overflow-y-scroll">
                <div className="w-full h-fit flex flex-col justify-between items-start p-5">
                    <div className="w-full h-fit flex-1 flex-row p-5">
                        <div className="w-full flex flex-row justify-between items-center">
                            <div className=" flex flex-row justify-normal items-center">
                                <Image src={"/icons/tv.png"} height={35} width={35} alt={""} unoptimized={true} className="mr-2"/>
                                <p className="text-xl font-bold text-white">Live Battle Rooms</p>
                            </div>
                            <button className="h-[50px] w-fit pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg" 
                            onClick={open_createBattle}>{"Create room"}</button>
                        </div>
                        <div className="w-full h-[400px] flex flex-col p-5 mr-3 mt-2 bg-fg border-4 border-item-bd rounded-lg shadow-lg">
                            <div className="w-full h-fit overflow-y-auto">
                                {
                                    liveBattles?.map((e) => (
                                        <div key={e.battleId} className="w-full h-fit flex flex-row justify-between items-center bg-fg rounded-lg border-4 border-fg-item p-3 mb-1 shadow-md">
                                            <div className="flex flex-col">
                                                <div className="flex flex-row justify-normal items-center">
                                                    <p className="text-xs font-bold text-white">{"BattleID: #"}</p>
                                                    <p className="text-xs text-gray-100 italic">{e.battleId}</p>
                                                </div>
                                                <div className="flex flex-row justify-normal items-start mt-3">
                                                    <Image src={"/icons/icon_guild.png"} height={35} width={35} alt={""} unoptimized={true} />
                                                    <div className="flex flex-col justify-normal items-start">
                                                        <p className="text-xs font-bold text-white">{"Player 1:"}</p>
                                                        <p className="text-xs text-gray-100 italic">{e.client1.address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row justify-normal items-start">
                                                    <Image src={"/icons/icon_guild.png"} height={35} width={35} alt={""} unoptimized={true} />
                                                    <div className="flex flex-col justify-normal items-start">
                                                        <p className="text-xs font-bold text-white">{"Player 2:"}</p>
                                                        <p className="text-xs text-gray-100 italic">{e.client2.address}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-normal items-center">
                                                <button className="h-fit w-fit flex flex-row justify-center items-center p-2 bg-blue-600 text-white rounded-item-bd drop-shadow-lg  border-bg border-4 rounded-lg" onClick={()=>{
                                                    router.push(`http://${process.env.NEXT_PUBLIC_FRONTEND}/colliseum/${e.battleId}`)
                                                }}>
                                                    <Image src={"/icons/tv.png"} height={25} width={25} alt={""} unoptimized={true} />
                                                    <p className="text-sm font-bold text-white ml-1">{"Share lobby link"}</p>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-fit flex-row p-5">
                        <div className=" flex flex-row justify-normal items-center">
                            <Image src={"/icons/icon_history.png"} height={35} width={35} alt={""} unoptimized={true} className="mr-2"/>
                            <p className="text-xl font-bold text-white">Previous logs</p>
                        </div>
                        <div className="w-full h-[500px] flex flex-row p-5 mr-3 mt-2 bg-fg border-4 border-item-bd rounded-lg shadow-lg">

                        </div>
                    </div>
                </div>
                <div className="w-full max-w-[400px] min-h-screen flex flex-col p-5">
                    <div className=" flex flex-row justify-normal items-center">
                        <Image src={"/icons/setting.png"} height={35} width={35} alt={""} unoptimized={true} className="mr-2" />
                        <p className="text-xl font-bold text-white">Participants</p>
                    </div>
                    <div className="w-full h-full flex flex-row p-5 mr-3 mt-2 bg-fg border-4 border-item-bd rounded-lg shadow-lg">

                    </div>
                </div>
            </div>
        </main>
    )
}