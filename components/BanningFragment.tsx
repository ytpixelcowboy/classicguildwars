'use client'

import { useState, useEffect, useRef } from "react"
import { Socket } from "socket.io-client";

import Image from "next/image";
import fetchProfileName from "@/scripts/getProfileName";
import TurnAnnouncer from "./TurnAnnouncer";
import DefaultMediumModal from "@/modals/DefaultMediumModal";

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
    const [client1BannedAxies, setClient1BannedAxies] = useState<string[]>([]);
    const [client1Name, setClient1Name] = useState<string>(params.address);
    const [client2Axies, setClient2Axies] = useState<string[]>([]);
    const [client2BannedAxies, setClient2BannedAxies] = useState<string[]>([]);
    const [client2Name, setClient2Name] = useState<string>(params.address);

    let [banningClient, setBanningClient] = useState<string>("");
    let [banAxieCount,setBanAxieCount] = useState<number>(0);
    let [banningTimeLimit, setBanningTimeLimit] = useState<number>(0);

    const [selectedBannedAxies, setSelectedBannedAxies] = useState<string[]>([]);


    useEffect(()=>{
        fetchProfileName(params.address).then(setClient1Name);
        fetchProfileName(params.client2_address).then(setClient2Name);
        
        //Get Banning Info
        params.socket.emit('banningPhase', params.battleId, params.address);

        requestBattleInfo();

        //const socket = params.currentSocket;
        params.socket.on('resultBattleInfo', (battleId : string, status : number, data : BattleInfo)=>{
            if (battleId == params.battleId && status == 1) {
                console.log("Parsing battle info")

                if (params.address == data.client1.address) {

                    setClient1Axies([...data.client1.axies]);
                    setClient1BannedAxies([...data.client1.bannedAxies]);
                    
                    setClient2Axies([...data.client2.axies]);
                    setClient2BannedAxies([...data.client2.bannedAxies]);
                } else {
                    setClient1Axies([...data.client2.axies]);
                    setClient1BannedAxies([...data.client2.bannedAxies]);

                    setClient2Axies([...data.client1.axies]);
                    setClient2BannedAxies([...data.client1.bannedAxies]);
                }
            }
        })

        //Banning Info
        params.socket.on('initiateBan', (banningClient : string, banCount : number, timelimit : number)=>{
            setBanningClient(banningClient);
            setBanAxieCount(banCount);
            setBanningTimeLimit(timelimit);
            console.log(`${banningClient}   ${banCount}   ${timelimit}`)
        })

        //Listen to force reload of ban info
        //helps when a user is currently connected to the game to trigger handshake request without needing to click anything in other side
        params.socket.on('forceRespondHandshake',(targetClient)=>{
            if(targetClient == params.address){
                console.log("Client Responded to force handshake")
                requestIncrementTurnHandshake();
            }
        })
    },[])

    useEffect(()=>{
        if(params.address == banningClient && banAxieCount == selectedBannedAxies.length){
            //Trigger confirm ban dialog
            open_banPick();
        }else{
            //close_banPick();
        }
    },[selectedBannedAxies])

    function requestIncrementTurnHandshake(){
        params.socket.emit('requestHandshake', params.battleId, params.address, params.client2_address, 'incrementTurn');
    }

    function submitBanPick(axieIds : string[]){
        setBanAxieCount((prev) => prev - 1);
        console.log(`User ${params.address} submitted ban pick of axie id ${axieIds}.`);

        params.socket.emit('banPick', params.battleId, params.address, axieIds, (callback : number)=>{
            if(callback == 1){
                close_banPick();

                //Trigger and forces the other player to do 'submitHandshakeRequest' emit
                params.socket.emit('broadcastNotif', params.battleId, 'forceOnWait_incrementTurnHandshake', params.client2_address); 

                //Waiting for other player to accept the handshake and increment the turn
                requestIncrementTurnHandshake();

                requestBattleInfo();
                console.log("Ban picked success");
            }
        });
    }

    const ref_banPick = useRef<HTMLDialogElement>(null);
    const open_banPick = ()=>ref_banPick.current?.showModal();
    function close_banPick(){
        setSelectedBannedAxies([]);
        ref_banPick.current?.close();
    }

    function requestBattleInfo(){
        console.log("Battle Request submitted: banning")
        params.socket.emit('battleInfo', params.battleId, params.address);
    }

    return (
        <div className="w-full min-h-screen flex flex-row justify-between p-10">
            {
                (banningClient == params.address)
                ?
                <TurnAnnouncer params={{header: "Its your turn"}} />
                :
                <TurnAnnouncer params={{header: "Its your enemy's turn"}} />
            }
            <DefaultMediumModal ref={ref_banPick} header={"Confirm Axie(s) to ban"}>
                <div className="w-full h-fit bg-fg p-5 flex flex-wrap justify-center items-center">
                    <p className="text-sm text-white font-semibold">{`Click an axie to remove from draft ban`}</p>
                    <div className="w-full h-full flex flex-wrap justify-center items-center p-5 mt-5 overflow-y-auto bg-fg-shadow rounded-lg">
                        {
                            selectedBannedAxies.map((e, index) => (
                                <button key={index} className="w-[140px] h-[140px] flex flex-col justify-center items-center m-1 bg-fg-item p-2 border-fg border-4 rounded-xl shadow-xl" onClick={() => {
                                    setSelectedBannedAxies((prev) => [...prev.splice(prev.indexOf(e))]);
                                }}>
                                    <div className="w-[80px] h-[80px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
                                        <Image src={`https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png`} width={200} height={200} alt="" unoptimized={true} className="inline-block object-fill scale-150 absolute" />
                                    </div>
                                    <div className="w-fit flex flex-row justify-normal items-center">
                                        <p className="text-sm text-white font-semibold">{`Axie #${e}`}</p>
                                    </div>
                                </button>
                            ))
                        }
                    </div>
                    <button className="h-[50px] w-[200px] mt-5 pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg" onClick={()=>{
                        submitBanPick(selectedBannedAxies);
                    }} disabled={selectedBannedAxies.length != banAxieCount}>{"Confirm"}</button>
                    <button className="h-[50px] w-[200px] mt-5 pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg hover:bg-yellow-500 border-bg border-4 rounded-lg" onClick={()=>close_banPick()}>{"Discard"}</button>
                </div>
            </DefaultMediumModal>
            <div className="w-full max-w-[800px] h-[650px] flex flex-col justify-center items-center mr-5">
                <div className="max-w-[600px] flex flex-col justify-normal items-center">
                <p className="text-4xl font-black text-yellow-50 shadow-md text-ellipsis overflow-hidden line-clamp-2">{client1Name}</p>
                <p className="text-xl text-slate-200 shadow-md">{(params.address == banningClient) ? "You are banning" : ""}</p>
                </div>
                <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg shadow-lg  flex flex-col justify-center items-start ">
                    <div className="w-fit h-full flex flex-wrap justify-center items-center overflow-y-auto ">
                        {
                            client1Axies.map((e, index) => (
                                <div key={index} className={`w-[140px] h-[140px] m-1 p-2 border-4 rounded-xl shadow-xl  ${(client1BannedAxies.some((obj) => obj == e)) ? "bg-slate-800 border-red-700" : "bg-fg-item border-fg"}`}>
                                    <div className="flex flex-col justify-center items-center relative">
                                        <div className={`w-full h-full flex flex-col justify-center items-center absolute ${(client1BannedAxies.some((obj) => obj == e)) ? "block" : "hidden"} z-10`} >
                                            <Image src={`/icons/banned.png`} width={80} height={80} alt="" unoptimized={true} className={`inline-block`} />
                                        </div>
                                        <div className="w-full h-full flex flex-col justify-center items-center ">
                                            <div className="w-[80px] h-[80px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
                                                <Image src={`https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png`} width={200} height={200} alt="" unoptimized={true} className="inline-block object-fill scale-150 absolute" />
                                            </div>
                                            <div className="w-fit flex flex-row justify-normal items-center">
                                                <p className="text-sm text-white font-semibold">{`Axie #${e}`}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[800px] h-[650px] flex flex-col justify-center items-center ml-5">
                <div className="max-w-[600px] flex flex-col justify-normal items-center">
                    <p className="text-4xl font-black text-yellow-50 shadow-md text-ellipsis overflow-hidden line-clamp-2">{client2Name}</p>
                    <p className="text-xl text-slate-200 shadow-md">{(params.address != banningClient) ? "Your enemy is banning" : ""}</p>
                </div>
                <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg shadow-lg  flex flex-col justify-center items-start ">
                    <div className="w-fit h-full flex flex-wrap justify-center items-center overflow-y-auto ">
                        {
                            client2Axies.map((e, index) => (
                                <button key={index} className="w-[140px] h-[140px] m-1 bg-fg-item p-2 border-fg border-4 rounded-xl shadow-xl disabled:bg-slate-800 disabled:border-red-700" onClick={() => {
                                    
                                    //Queue Selected Banned Axies
                                    setSelectedBannedAxies((prev)=> [...prev, e]);
                                    }}
                                    
                                    disabled={(client2BannedAxies.some((obj) => obj == e))|| (selectedBannedAxies.some((obj) => obj == e)) || (params.address != banningClient) || (params.address == banningClient && banAxieCount == selectedBannedAxies.length)}>
                                    <div className="flex flex-col justify-center items-center relative">
                                        <div className={`w-full h-full flex flex-col justify-center items-center absolute ${(client2BannedAxies.some((obj) => obj == e)) ? "block" : "hidden"} z-10`} >
                                            <Image src={`/icons/banned.png`} width={80} height={80} alt="" unoptimized={true} className={`inline-block`} />
                                        </div>
                                        <div className="w-full h-full flex flex-col justify-center items-center ">
                                            <div className="w-[80px] h-[80px] bg-sm-bg rounded-lg p-2 flex flex-col justify-center items-center relative overflow-hidden">
                                                <Image src={`https://assets.axieinfinity.com/axies/${e}/axie/axie-full-transparent.png`} width={200} height={200} alt="" unoptimized={true} className="inline-block object-fill scale-150 absolute" />
                                            </div>
                                            <div className="w-fit flex flex-row justify-normal items-center">
                                                <p className="text-sm text-white font-semibold">{`Axie #${e}`}</p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}