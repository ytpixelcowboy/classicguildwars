'use client'

import Image from "next/image";
import { useState, useEffect } from "react"
import { useRouter } from "next/router";
import getAxieData from "@/scripts/getAxieData";

interface Axie {
    id: string,
    name: string,
    image: string,
    class: string,
    isBanned?: boolean
}

interface SocketResponse{
    intent : string,
    msg? : string,
    status? : number,
    battleId : string,
    userId : string,
    data? : BattleInfo,
  }
  
  interface BattleInfo{
    battleId : string,
    status : number,
    phase : 0,
    createdBy : string,
    startedAt : number,
    endedAt : number,
    client1 : ClientInfo,
    client2 : ClientInfo
  }
  
  interface ClientInfo{
    address : string,
    status : number,
    isBanTurn : boolean,
    timeBank : number,
    axies : string[],
    bannedAxies : string[],
  }

export default function DraftinFragment({params} : {params : {battleId : string, address : string}}) {

    const socket = new WebSocket(`ws://192.168.56.1:4020`);

    var [progress, setProgress] = useState<number>(0);
    const [client_address,setClient_address] = useState<string>();
    const [clientAxies, setClientAxies] = useState<Axie[]>();
    const [clientAxies_drafted, setClientAxies_drafted] = useState<Axie[]>();

    const [client2_address,setClient2_address] = useState<string>();

    //const socket = params.currentSocket;

    socket.addEventListener('open', (event)=>{
        socket.send(JSON.stringify({
            'battleId' : params.battleId,
            'intent' : 'battleInfo',
        }));
    })

    socket.addEventListener('connection', (event)=>{
        socket.addEventListener('message', (event)=>{
            const res : SocketResponse = JSON.parse(event.data);

            
            if(res.intent == "resultBattleInfo" && res.battleId == params.battleId && res.userId == params.address){
                if(params.address == res.data?.client1.address){
                    setClient_address(res.data?.client1.address);
                    setClient2_address(res.data?.client2.address);
                }else{
                    setClient_address(res.data?.client2.address);
                    setClient2_address(res.data?.client1.address);
                }
            }
        })

        socket.addEventListener('error', (event)=>{
            console.log(event)
        })
    })

    useEffect(()=>{
        getAxieData(params.address).then(setClientAxies);
    }, [params.address])


    return (
        <div className="w-full h-full flex flex-col justify-normal">
            <p className="text-4xl font-bold mb-5">Axie Drafting</p>
                <p className="text-xl text-gray-200">Select 13 axies that you want to draft pick.</p>
                <p className="text-xl text-gray-200">Note: Your enemy can ban X axies after the draft pick phase</p>

                <div className="flex flex-row min-h-full max-h-[720px] justify-between items-start">
                    <div className="w-full h-[720px] overflow-y-scroll flex flex-wrap justify-center items-center mt-5 p-5 bg-fg border-fg-item border-4 shadow-lg rounded-lg mr-2">
                        {
                            clientAxies?.map((e: Axie) => (
                                <div key={e.id} className="w-[180px] h-[180px] rounded-md bg-fg-item m-2 border-fg-shadow border-2 flex flex-col justify-normal items-center">
                                  <div className="w-[180px] h-[180px] flex flex-col justify-center items-center">
                                    <Image src={"https://assets.axieinfinity.com/axies/" + e.id + "/axie/axie-full-transparent.png"} height={180} width={180} alt={""} unoptimized={true} />
                                  </div>
                                  <div className="w-full h-full bg-yellow-100 rounded-md p-2 flex flex-col justify-center items-center">
                                    <p className="text-orange-950 italic font-semibold text-sm line line-clamp-1">{e.name}</p>
                                  </div>
                                </div>
                              ))
                        }
                    </div>
                    <div className="w-full h-[720px] overflow-y-scroll mt-5 p-5 bg-fg border-fg-item border-4 shadow-lg rounded-lg ml-2">

                    </div>
                </div>
        </div>
    )
}