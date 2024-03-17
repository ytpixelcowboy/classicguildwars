'use client'

import Image from "next/image";
import { useState, useEffect } from "react"
import { useRouter } from "next/router";
import getAxieData from "@/scripts/getAxieData";
import { env } from "process";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";
import { Socket } from "dgram";

interface Axie {
    id: string,
    name: string,
    image: string,
    class: string,
    isBanned?: boolean
}

interface SocketResponse {
    intent: string,
    msg?: string,
    status?: number,
    battleId: string,
    userId: string,
    data?: BattleInfo | any,
}

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

export default function DraftinFragment({ params }: { params: { battleId: string, address: string } }) {

    const socket = new WebSocket(`ws://192.168.68.102:4020`);

    var [progress, setProgress] = useState<number>(0);
    const [client_address, setClient_address] = useState<string>();
    const [clientAxies, setClientAxies] = useState<string[]>(["", "", "", "", "", "", "", "", "", "", "", "", ""]);

    const [client2_address, setClient2_address] = useState<string>();


    function delay(milliseconds: number): any {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    //const socket = params.currentSocket;

    socket.addEventListener('open', (event) => {
        socket.send(JSON.stringify({
            'battleId': params.battleId,
            'intent': 'battleInfo',
            'userId' : getUserAddressToLocal()
        }));
    })

    socket.addEventListener('message', (event) => {
        const res: SocketResponse = JSON.parse(event.data);

        if (res.intent == "resultBattleInfo" && res.battleId == params.battleId && res.userId == params.address) {
            if (params.address == res.data?.client1.address) {
                setClient_address(res.data?.client1.address);
                setClient2_address(res.data?.client2.address);

                
                const res_axies = res.data.client1.axies as string[];
                console.log(res_axies);
                setClientAxies([...res_axies]);
            } else {
                setClient_address(res.data?.client2.address);
                setClient2_address(res.data?.client1.address);

                const res_axies = res.data.client2.axies as string[];
                console.log(res_axies);
                setClientAxies([...res_axies]);
            }
        }
    })

    function submitDraftingEntry(){
        if(socket.OPEN){
            socket.send(JSON.stringify({
                'channel': params.battleId,
                'intent': 'draftAxie',
                'userId' : getUserAddressToLocal(),
                'data' : clientAxies
            }));
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col justify-normal">
            <div className="flex flex-row justify-between">
                <div>
                    <p className="text-4xl font-bold mb-5">Axie Drafting</p>
                    <p className="text-xl text-gray-200">Add 13 axies that you want to draft pick.</p>
                    <p className="text-xl text-gray-200">Note: Your enemy can ban X axies after the draft pick phase</p>
                </div>
                <div>
                <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-fg-shadow border-4 rounded-lg" onClick={()=>submitDraftingEntry()} disabled={clientAxies.some((obj)=> obj=="")}>{"Confirm"}</button>
                </div>
            </div>

            <div className="w-full h-fit flex flex-col justify-center items-center mt-5">
                <div className="w-fit h-fit flex flex-wrap justify-center items-center">
                    {
                        clientAxies.map((e: string, index) => (
                            <div key={index} className="w-fit flex flex-col justify-center items-center m-3 bg-fg-item p-5 border-fg-shadow border-4 rounded-xl shadow-xl">
                                <div className="w-full h-[150px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center">
                                    <Image src={(e) ? `https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png` : "/icons/unknown_axie.png"} width={150} height={150} alt="" unoptimized={true} className="inline-block" />
                                </div>
                                <div className="w-fit flex flex-row justify-normal items-center">
                                    <p className="text-white font-semibold mr-2">ID #</p>
                                    <input className="w-[100px] font-sans bg-sm-bg-light text-orange-950 p-3 border-solid border-slate-400 rounded-md mt-2" type="number" placeholder="8278299" inputMode={"numeric"} onChange={async (event) => {
                                        await delay(1000);

                                        const input = event.target.value;

                                        if(input.toString().match('e') || Number.isNaN(input)){
                                            event.target.value = clientAxies[index];
                                            console.log("Entry is not a number");
                                            return;
                                        }

                                        if(!Number.isNaN(input) && Number.parseInt(input) < 1){
                                            event.target.value = clientAxies[index];
                                            console.log("Entry cannot be zero");
                                            return;
                                        }

                                        if (clientAxies.some((obj) => obj == input)) {
                                            event.target.value = clientAxies[index];
                                            console.log("Duplicate");
                                        } else {
                                            const format = clientAxies;
                                            format[index] = input;

                                            setClientAxies([...format]);
                                        }
                                    }}></input>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}