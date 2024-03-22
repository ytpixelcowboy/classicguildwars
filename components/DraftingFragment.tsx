'use client'

import Image from "next/image";
import { useState, useEffect } from "react"
import { io, Socket } from "socket.io-client";

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
    battleId?: string,
    channel?: string,
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

export default function DraftinFragment({ params }: { params: {socket: Socket, battleId: string, address: string, client2_address : string } }) {
    const [clientAxies, setClientAxies] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]);
    //const [clientAxies, setClientAxies] = useState<string[]>(["", "", "", "", "", "", "", "", "", "", "", "", ""]);
    const [isSubmitDraft, setIsSubmitDraft] = useState<boolean>(false);

    function delay(milliseconds: number): any {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    //const socket = params.currentSocket;

    useEffect(()=>{
        params.socket.emit('battleInfo', params.battleId , params.address)
    })

        console.log("FromParams: " + params.address);
        console.log("FromParams: " + params.battleId);
        console.log("FromParams: " + params.client2_address);


        params.socket.on('resultBattleInfo', (battleId : string, status : number, data : BattleInfo)=>{
            
            if (battleId == params.battleId && status == 1) {
                console.log("Parsing battle info")
    
                if (params.address == data.client1.address) {
                    
                    const res_axies = data.client1.axies as string[];
                    console.log(res_axies);
    
                    if(res_axies.length == 13){
                        setClientAxies([...res_axies]);
                    }
                } else {
                    const res_axies = data.client2.axies as string[];
                    console.log(res_axies);
    
                    if(res_axies.length == 13){
                        setClientAxies([...res_axies]);
                    }
                    
                }
            }
        })                                                                       

        params.socket.on('respondDraftAxie', (userId : string, battleId: string, status : number)=>{
            console.log("Drafting : Draft has been submitted and verified");
                //Notif the page controller that user is done with drafting
            requestBattleInfo();
        })

    function requestBattleInfo(){
        if(params.socket.connected){
            console.log("Battle Request submitted: drafting")
            params.socket.emit('battleInfo', params.battleId, params.address);
        }
    }

    function submitDraftingEntry(){
        if(params.socket.connected){
            params.socket.emit('draftAxie',params.battleId, params.address, clientAxies);

            //request handshake

            params.socket.emit('requestHandshake',params.battleId,params.address,params.client2_address, 'upgradePhase');

            setIsSubmitDraft(true);
        }else{
            console.log("Websocket is not connected");
            setIsSubmitDraft(false);
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col justify-normal items-center p-5">
                <div className="w-full xl:w-[1280px] flex flex-row justify-between">
                    <div>
                        <p className="text-4xl font-bold mb-5">Axie Drafting</p>
                        <p className="text-xl text-gray-200">Add 13 axies that you want to draft pick.</p>
                        <p className="text-xl text-gray-200">Note: Your enemy can ban X axies after the draft pick phase</p>
                    </div>
                    <div>
                        <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-fg-shadow border-4 rounded-lg" onClick={() => submitDraftingEntry()} disabled={clientAxies.some((obj) => obj == "" || obj.includes('e') || Number.parseFloat(obj) < 1) || isSubmitDraft}>{"Confirm"}</button>
                    </div>
                </div>

                <div className="w-full min-h-screen flex flex-col justify-center items-center mt-5">
                    <div className="w-fit h-fit flex flex-wrap justify-center items-center">
                        {
                            clientAxies.map((e: string, index) => (
                                <div key={index} className="w-[200px] flex flex-col justify-center items-center m-3 bg-fg-item p-3 border-fg-shadow border-4 rounded-xl shadow-xl">
                                    <div className="w-[130px] h-[130px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center relative">
                                        <Image src={(e) ? `https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png` : "/icons/unknown_axie.png"} width={200} height={200} alt="" unoptimized={true} className="inline-block scale-[1.5] object-fill absolute" />
                                    </div>
                                    <div className="w-full flex flex-row justify-normal items-center">
                                        <p className="w-fit text-white font-semibold mr-2">#</p>
                                        <input className="w-full flex-1 font-sans bg-sm-bg-light text-orange-950 p-3 border-solid border-slate-400 rounded-md mt-2" type="number" placeholder="8278299" inputMode={"numeric"} onChange={async (event) => {
                                            await delay(1000);

                                            const input = event.target.value;

                                            if (input.toString().match('e') || Number.isNaN(input)) {
                                                event.target.value = clientAxies[index];
                                                console.log("Entry is not a number");
                                                return;
                                            }

                                            if (!Number.isNaN(input) && Number.parseInt(input) < 1) {
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