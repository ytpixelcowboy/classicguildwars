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

interface Axie {
    id: string,
    name: string,
    image: string,
    class: string,
    isBanned?: boolean
}

export default function BanningFragment({ params }: { params: { socket: Socket, battleId: string, address: string, client2_address: string } }) {

    const [client1Axies, setClient1Axies] = useState<string[]>([]);
    const [client1Name, setClient1Name] = useState<string>(params.address);
    const [client2Axies, setClient2Axies] = useState<string[]>([]);
    const [client2Name, setClient2Name] = useState<string>(params.address);


    useEffect(()=>{
        requestBattleInfo();

        //const socket = params.currentSocket;
        params.socket.on('resultBattleInfo', (battleId : string, status : number, data : BattleInfo)=>{
            if (battleId == params.battleId && status == 1) {
                console.log("Parsing battle info")

                if (params.address == data.client1.address) {
                    
                    const res_axies1 = data.client1.axies as string[];
                    const res_axies2 = data.client2.axies as string[];
                    console.log("CL1: " + res_axies1);

                    if(res_axies1.length == 13){
                        setClient1Axies([...res_axies1]);
                        setClient2Axies([...res_axies2]);
                    }
                } else {
                    const res_axies1 = data.client1.axies as string[];
                    const res_axies2 = data.client2.axies as string[];
                    console.log("CL1: " + res_axies1);

                    if(res_axies1.length == 13){
                        setClient1Axies([...res_axies2]);
                        setClient2Axies([...res_axies1]);
                    }
                    
                }
            }
        })
    },[])


    useEffect(()=>{
        fetchProfileName(params.address).then(setClient1Name);
        fetchProfileName(params.client2_address).then(setClient2Name);
    },[params])

    function requestBattleInfo(){
        console.log("Battle Request submitted: banning")
        params.socket.emit('battleInfo', params.battleId, params.address);
    }

    return (
        <div className="w-full min-h-screen flex flex-row justify-between p-10">
            <div className="w-full max-w-[800px] h-[650px] flex flex-col justify-center items-center mr-5">
                <div className="max-w-[600px] flex flex-col justify-normal items-center">
                <p className="text-4xl font-black text-yellow-50 shadow-md text-ellipsis overflow-hidden">{client1Name}</p>
                <p className="text-xl text-slate-200 shadow-md">{"Guild 1"}</p>
                </div>
                <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg shadow-lg  flex flex-col justify-center items-start ">
                    <div className="w-fit h-full flex flex-wrap justify-center items-center overflow-y-auto ">
                        {
                            client1Axies.map((e, index)=>(
                                <div key={index} className="w-fit flex flex-col justify-center items-center m-1 bg-fg-item p-5 border-fg-shadow border-4 rounded-xl shadow-xl">
                                    <div className="w-[120px] h-[120px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
                                        <Image src={`https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png`} width={200} height={200} alt="" unoptimized={true} className="inline-block object-fill scale-150 absolute" />
                                    </div>
                                    <div className="w-fit flex flex-row justify-normal items-center">
                                        <p className="text-sm text-white font-semibold">{`Axie #${e}`}</p>
                                    </div>
                                </div>    
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[800px] h-[650px] flex flex-col justify-center items-center ml-5">
            <div className="max-w-[600px] flex flex-col justify-normal items-center">
                <p className="text-4xl font-black text-yellow-50 shadow-md text-ellipsis overflow-hidden">{client2Name}</p>
                <p className="text-xl text-slate-200 shadow-md">{"Guild 1"}</p>
                </div>
                <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg shadow-lg  flex flex-col justify-center items-start ">
                    <div className="w-fit h-full flex flex-wrap justify-center items-center overflow-y-auto ">
                        {
                            client2Axies.map((e, index) => (
                                <div key={index} className="w-[160px] flex flex-col justify-center items-center m-1 bg-fg-item p-5 border-fg-shadow border-4 rounded-xl shadow-xl">
                                    <div className="w-[100px] h-[100px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
                                        <Image src={`https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png`} width={200} height={200} alt="" unoptimized={true} className="inline-block object-fill scale-150 absolute" />
                                    </div>
                                    <div className="w-fit flex flex-row justify-normal items-center">
                                        <p className="text-sm text-white font-semibold">{`Axie #${e}`}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}