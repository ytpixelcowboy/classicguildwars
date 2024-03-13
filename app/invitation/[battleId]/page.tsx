'use client'

import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"
import { checkIfConnected, connectRoninWallet } from "@/utils/ConnectWallet";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";

interface SocketResponse{
  intent : string,
  msg? : string,
  status? : number,
  battleId : string,
  userId : string,
}

export default function InvitationPage({params} : {params : {battleId : string}}) {
  const router = useRouter();

  var [errMsg, setErrMsg] = useState<string>();
  var [isConnecting, setConnectingState] = useState<boolean>(false);
  var [address, setAddress] = useState<string | any>();

  function func_connectWallet() {
    console.log("Is wallet connected: " + checkIfConnected())

    connectRoninWallet().then(() => {
      setAddress(getUserAddressToLocal())
    });
  }

  function connectToWebsocket(){
    setConnectingState(true);
    const socket = new WebSocket(`ws://192.168.68.102:4020`);

    socket.addEventListener('open', (event)=>{
      console.log("Connected.")

      socket.send(JSON.stringify({
        intent : "joinBattle",
        battleId : params.battleId,
        userId : getUserAddressToLocal()
      }));

    })

    socket.addEventListener('message', (message)=>{
      const res : SocketResponse = JSON.parse(message.data);

      if(res.intent === "permitJoin" && res.userId === getUserAddressToLocal() && res.status == 1){
        console.log("Connection Permitted");
        socket.send(JSON.stringify({
            'intent' : 'ping',
            'battleId' : params.battleId,
            "userId" : getUserAddressToLocal()
        }));

        router.push(`/drafting/${params.battleId}`)
      }else if(res.intent === "permitJoin" && res.userId === getUserAddressToLocal() && res.status == 0){
        console.log('Failed to join battle: ', res.msg);
        setErrMsg(res.msg);
        setConnectingState(false);
      }else if(res.intent === "permitJoin" && res.userId === getUserAddressToLocal() && res.status == -1){
        console.log('Failed to join battle: ', res.msg);
        setErrMsg(res.msg);
        setConnectingState(false);
      }
    })
  }

  return (
    <main className='flex min-h-screen flex-col justify-center items-center p-24 bg-bg-sub'>
      <div className="w-fit flex flex-col justify-normal items-center">
        <Image src={"/icons/Sword.png"} width={130} height={130} alt="" unoptimized={true} className="inline-block" />
        <p className="text-white mt-6 font-bold text-2xl">You have been invited by the organizer to a battle</p>
        <p className="text-orange-100 text-xl">Connect your wallet to verify your invitation</p>
        {
          (errMsg)
          ?
          <p className="text-red-400 text-lg">{`An error occur: ${errMsg}`}</p>
          :
          <span/>
        }

        <div className="w-fit mt-10">
          {
            (address != null)
            ?
            <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg" onClick={connectToWebsocket} disabled={isConnecting}>{"Join lobby"}</button>
            :
            <button className="h-[50px] w-fit pl-6 pr-6 pt-2 pb-2 bg-blue-600 text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 rounded-lg flex flex-row justify-normal items-center" onClick={func_connectWallet}>{"Connect Ronin Wallet"}</button>
          }
        </div>
      
      </div>
    </main>
  )
}