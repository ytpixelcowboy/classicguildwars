'use client'

import { useState, useEffect } from "react"
import { Socket } from "socket.io-client";

import Image from "next/image";
import fetchProfileName from "@/scripts/getProfileName";

interface BattleInfo {
    battleId: string,
    status: number,
    phase: 0,
    createdBy: string,
    startedAt: number,
    endedAt: number,
    client1: ClientInfo,
    client2: ClientInfo,
}

interface ClientInfo {
    address: string,
    status: number,
    isBanTurn: boolean,
    timeBank: number,
    axies: string[],
    bannedAxies: string[],
}

export default function PreBanningFragment({ params }: { params: { socket: Socket, battleId: string, address: string, client2_address: string } }) {

    const [client1Name, setClient1Name] = useState<string>(params.address);
    const [client1IsReady, setClient1IsReady] = useState<boolean>(false);
    const [client2Name, setClient2Name] = useState<string>(params.client2_address);
    const [client2IsReady, setClient2IsReady] = useState<boolean>(false);

    const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);

    useEffect(()=>{
        checkForPendingRequest();
        
        fetchProfileName(params.address).then(setClient1Name);
        fetchProfileName(params.client2_address).then(setClient2Name);
    },[])


    params.socket.on('respondPendingHandshake', (reason, battleId, requester, status)=>{
        if(reason == "moveToWaiting" && status == 1){
            if(requester == params.address){
                setClient1IsReady(true);
                setHasConfirmed(true);
            }
            if(requester == params.client2_address){
                setClient2IsReady(true);
            }
        }
    })

    function checkForPendingRequest(){
        console.log("Battle Request submitted: banning")
        params.socket.emit('pendingHandshake', 'moveToWaiting', params.battleId, params.address);
    }

    function setReady(){
        setClient1IsReady(true);
        setHasConfirmed(true);
        params.socket.emit('requestHandshake',params.battleId,params.address,params.client2_address, 'moveToWaiting');

        checkForPendingRequest();
    }

    return (
        <div className="w-full h-fit flex flex-col justify-center items-center">
            <div className="w-full h-[300px] flex flex-row justify-around">
                <div className="w-full max-w-[500px] h-full flex flex-col justify-center items-center overflow-hidden">
                    <p className="w-full max-w-[500px] text-4xl font-black text-yellow-50 text-center text-ellipsis overflow-hidden">{client1Name}</p>
                    <p className="text-xl text-slate-200">{"Your guild"}</p>
                    <div className="flex flex-row justify-normal items-center bg-cyan-900 border-cyan-700 border-4 px-3 py-2 rounded-lg shadow-xl mt-5">
                        <Image src={(client1IsReady)?"/icons/checked.png" : "/icons/check_bg.png"} width={25} height={25} alt="" unoptimized={true} className="inline-block mr-2" />
                        <p className="text-sm text-white">{(client1IsReady) ? "Ready" : "Waiting"}</p>
                    </div>
                </div>
                <div className="w-full max-w-[500px] h-full flex flex-col justify-center items-center overflow-hidden">
                    <p className="w-full max-w-[500px] text-4xl font-black text-yellow-50 text-center text-ellipsis overflow-hidden">{client2Name}</p>
                    <p className="text-xl text-slate-200 shadow-md">{"Enemy Guild"}</p>
                    <div className="flex flex-row justify-normal items-center bg-cyan-900 border-cyan-700 border-4 px-3 py-2 rounded-lg shadow-xl mt-5">
                        <Image src={(client2IsReady)?"/icons/checked.png" : "/icons/check_bg.png"} width={25} height={25} alt="" unoptimized={true} className="inline-block mr-2" />
                        <p className="text-sm text-white">{(client2IsReady) ? "Ready" : "Waiting"}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-normal items-center mt-10">
                {
                    (hasConfirmed)
                    ?
                    <p className="text-xl text-slate-200">{"Battle will start soon..."}</p>
                    :
                    <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-fg-shadow border-4 rounded-lg" onClick={setReady} disabled={hasConfirmed}>{"Ready"}</button>
                }
            </div>
        </div>
    )
}