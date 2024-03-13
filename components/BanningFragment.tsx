'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/router";
import { getUserAddressToLocal} from "@/utils/LocalStorageUtil";

interface Axie {
    id: string,
    name: string,
    image: string,
    class: string,
    isBanned?: boolean
  }

export default function BanningFragment({params} : {params : {battleId : string, address : string}}) {
    const socket = new WebSocket(`ws://192.168.68.102:4020`);

    const [battleStarted, setIsBattleStarted] = useState<boolean>();
    const [client1_address] = useState<string>();
    const [client1Axies, setClient1Axies] = useState<Axie[]>();
    const [client1Axies_drafted, setClient1Axies_drafted] = useState<Axie[]>();

    const [client2_address] = useState<string>();
    const [client2Axies, setClient2Axies] = useState<Axie[]>();
    const [client2Axies_drafted, setClient2Axies_drafted] = useState<Axie[]>();

    //const socket = params.currentSocket;

    socket.addEventListener('open', (event)=>{
        socket.send(JSON.stringify({
            'battleId' : params.battleId,
            'intent' : 'ping',
            "userId" : getUserAddressToLocal()
        }));
    })

    socket.addEventListener('connection', (event)=>{
        socket.addEventListener('error', (event)=>{
            console.log(event)
        })

        socket.addEventListener('error', (event)=>{
            console.log(event)
        })
    })


    return (
        <main className="w-full min-h-[720px] flex flex-col justify-normal">
            <p className="text-4xl font-bold mb-5">Banning Phase</p>
                <p className="text-xl text-gray-200">Select X axies from your enemy draft picks</p>

                <div className="w-full min-h-96 mt-5 p-5 bg-bg rounded-lg">

                </div>
        </main>
    )
}