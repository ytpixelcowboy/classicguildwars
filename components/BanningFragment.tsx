'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/router";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";

interface Axie {
    id: string,
    name: string,
    image: string,
    class: string,
    isBanned?: boolean
}

export default function BanningFragment({ params }: { params: {socket: WebSocket, battleId: string, address: string, client2_address : string } }) {

    const [client1Axies, setClient1Axies] = useState<Axie[]>();
    const [client2Axies, setClient2Axies] = useState<Axie[]>();

    //const socket = params.currentSocket;

    return (
        <main className="w-full min-h-[720px] flex flex-col justify-normal p-10">
            <div className="w-full min-h-screen flex flex-row justify-between">
                <div className="w-full min-h-screen flex flex-col justify-center items-center">
                    <p className="text-xl font-black">Guild 1</p>
                    <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg shadow-lg">

                    </div>
                </div>
                <div className="w-[200px] h-full">

                </div>
                <div className="w-full min-h-screen">
                <p className="text-xl font-bold mb-5">Guild 1</p>
                    <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg">

                    </div>
                </div>
            </div>
        </main>
    )
}