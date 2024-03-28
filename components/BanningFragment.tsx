'use client'

import { useState, useEffect, useRef, useMemo } from "react"
import { Socket } from "socket.io-client";

import Image from "next/image";
import fetchProfileName from "@/scripts/getProfileName";
import TurnAnnouncer from "./TurnAnnouncer";
import DefaultMediumModal from "@/modals/DefaultMediumModal";
import ConfirmBanAxies from "@/modals/ConfirmBanAxies";
import { emit } from "process";

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

    useMemo(()=>{
        fetchProfileName(params.address).then(setClient1Name);
        fetchProfileName(params.client2_address).then(setClient2Name);
        
        //Get Banning Info
        params.socket.emit('banningPhase', params.battleId, params.address);
        params.socket.emit('pendingHandshake', 'startTurn', params.battleId, params.address, );

        requestBattleInfo();
    },[])

    useMemo(()=>{
        console.log("Banning Fragment Reloaded")
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
        params.socket.on('initiateBan', (turnNumber: number, banningClient : string, banCount : number, timelimit : number)=>{

            if(banningClient == params.address){
                params.socket.emit('beginTurn', params.battleId, banningClient);
            }

            setBanningClient(banningClient);
            setBanAxieCount(banCount);
            setBanningTimeLimit(timelimit);
            console.log(`${banningClient}   ${banCount}   ${timelimit}`)
        })

        //Remove if the callback in banPick event works
        params.socket.on('resultBanPick', (status)=>{
            if(status == 1){
                func_closeBanPickDialog();

                //Trigger and forces the other player to do 'submitHandshakeRequest' emit
                params.socket.emit('broadcastNotif', params.battleId, 'forceOnWait_incrementTurnHandshake', params.client2_address);  //(Moved on server)

                //Waiting for other player to accept the handshake and increment the turn
                submitHandshake();

                requestBattleInfo();
                console.log("Ban picked success");
            }
        })

        params.socket.on('forceRespondHandshake',(targetClient)=>{
            if(targetClient == params.address){
                console.log("Client Responded to force handshake")
                //submitHandshake();
                params.socket.emit('requestHandshake', params.battleId, params.address, params.client2_address, 'startTurn');
            }
        })
    },[])

    useEffect(()=>{
        if(params.address == banningClient && banAxieCount == selectedBannedAxies.length){
            //Trigger confirm ban dialog
            open_banPick();
        }else{
            func_closeBanPickDialog();
        }
    },[selectedBannedAxies])

    const ref_banPick = useRef<HTMLDialogElement>(null);
    const open_banPick = ()=> ref_banPick.current?.showModal();
    const close_banPick = ()=> ref_banPick.current?.close();

    function func_closeBanPickDialog(){
        close_banPick();
        //setSelectedBannedAxies([]);
    }

    function submitHandshake(){
        params.socket.emit('requestHandshake', params.battleId, params.address, params.client2_address, 'startTurn');
    }

    function requestBattleInfo(){
        console.log("Battle Request submitted: banning")
        params.socket.emit('battleInfo', params.battleId, params.address);
    }

    function isAxieBanned(list : string[], axieId : string){
        const res = list.some((obj) => obj == axieId)
        return res;
    }

    function onClick_confirm(){
        if(params.socket.connected){
            console.log(`User ${params.address} submitted ban pick of axie id ${selectedBannedAxies}.`);
            params.socket.emit('banPick', params.battleId, params.address, selectedBannedAxies, async (callback: number) => {
                func_closeBanPickDialog();

                if (callback == 1) {
                    //Waiting for other player to accept the handshake and increment the turn
                    //submitHandshake();
                    params.socket.emit('requestHandshake', params.battleId, params.address, params.client2_address, 'startTurn');

                    //await delay(1000);

                    //Trigger and forces the other player to do 'submitHandshakeRequest' emit
                    params.socket.emit('broadcastNotif', params.battleId, 'forceOnWait_incrementTurnHandshake', params.client2_address);  //(Moved on server)


                    requestBattleInfo();
                    console.log("Ban picked success");
                    setSelectedBannedAxies([]);//Clear
                }
            });
        }
        

    }

    function delay(milliseconds: number): any {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function onClick_draftBan(axieId : string){
        //Queue Selected Banned Axies
        setSelectedBannedAxies((prev)=> [...prev, axieId]);
    }

    return (
        <div className="w-full h-fit flex flex-row justify-between p-10">
            <ConfirmBanAxies ref={ref_banPick} header={"Confirm Axie(s) to ban"}>
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
                    <button className="h-[50px] w-[200px] mt-5 pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg" onClick={onClick_confirm} disabled={selectedBannedAxies.length != banAxieCount}>{"Confirm"}</button>
                    <button className="h-[50px] w-[200px] mt-5 pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg hover:bg-yellow-500 border-bg border-4 rounded-lg" onClick={()=>func_closeBanPickDialog()}>{"Discard"}</button>
                </div>
            </ConfirmBanAxies>
            <div className="w-full max-w-[800px] h-[650px] flex flex-col justify-center items-center mr-5">
                <div className="max-w-[600px] flex flex-col justify-normal items-center">
                <p className="text-4xl font-black text-yellow-50 shadow-md text-ellipsis overflow-hidden line-clamp-2">{client1Name}</p>
                <p className="text-xl text-slate-200 shadow-md">{(params.address == banningClient) ? "You are banning" : ""}</p>
                </div>
                <div className="w-full h-full bg-fg-shadow mt-5 p-5 rounded-lg shadow-lg  flex flex-col justify-center items-start ">
                    <div className="w-fit h-full flex flex-wrap justify-center items-center overflow-y-auto ">
                        {
                            client1Axies.map((e, index) => (
                                <div key={index} className={`w-[140px] h-[140px] m-1 p-2 border-4 rounded-xl shadow-xl  ${(isAxieBanned(client1BannedAxies, e)) ? "bg-slate-800 border-red-700" : "bg-fg-item border-fg"}`}>
                                    <div className="flex flex-col justify-center items-center relative">
                                        <div className={`w-full h-full flex flex-col justify-center items-center absolute ${(isAxieBanned(client1BannedAxies, e)) ? "block" : "hidden"} z-10`} >
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
                                <button key={index} className="w-[140px] h-[140px] m-1 bg-fg-item p-2 border-fg border-4 rounded-xl shadow-xl disabled:bg-slate-800 disabled:border-red-700" onClick={()=>onClick_draftBan(e)}
                                    
                                    disabled={isAxieBanned(client2BannedAxies, e)|| isAxieBanned(selectedBannedAxies, e) || (params.address != banningClient) || (params.address == banningClient && banAxieCount == selectedBannedAxies.length)}>
                                    <div className="flex flex-col justify-center items-center relative">
                                        <div className={`w-full h-full flex flex-col justify-center items-center absolute ${isAxieBanned(client2BannedAxies, e) ? "block" : "hidden"} z-10`} >
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