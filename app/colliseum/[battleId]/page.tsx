'use client'

import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"
import { checkIfConnected, connectRoninWallet } from "@/utils/ConnectWallet";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";


import {io} from "socket.io-client";
import LobbyFragment from "@/components/LobbyFragment";

interface ClientInfo {
  address: string,
  status: number,
  hasAxiesDrafted: boolean,
  isBanTurn: boolean,
  timeBank: number,
  axies: string[],
  bannedAxies: string[],
}

const io_main = io(`ws://${process.env.NEXT_PUBLIC_WS}`);

export default function InvitationPage({ params }: { params: { battleId: string } }) {
  const router = useRouter();

  //Connectivity Controller
  var [signedAddress, setSignedAddress] = useState<string>("");
  var [isBattleIdValidated, setBattleIdValidStatus] = useState<boolean>(false);

  var [errMsg, setErrMsg] = useState<string>();
  var [isConnecting, setConnectingState] = useState<boolean>(false);

  function func_connectWallet() {
    console.log("Is wallet connected: " + checkIfConnected())

    connectRoninWallet().then((walletAddress)=>{
      if(walletAddress){
        setSignedAddress(walletAddress);
      }
    });
  }

  async function connectToWebsocket() {

    if (io_main.connected) {
      setConnectingState(true);
      io_main.emit('joinBattle', params.battleId, getUserAddressToLocal());
    } else {
      await delay(2000);
      setConnectingState(false);
      setErrMsg("websocket is diconnected");
    }
  }

  io_main.on('connected', () => {
    console.log("Connected: " + io_main.id);
  })

  io_main.on('disconnect', () => {
    console.log("Connected: " + io_main.id);
  })

  io_main.on('error', async (err) => {
    await delay(2000);
    console.log(`ERR : ${err}`)
    setConnectingState(false)
  })


  io_main.on("permitJoin", (battleId, userId, status, msg) => {
    console.log(io_main.id); // x8WIv7-mJelg7on_ALbx

    if (userId == signedAddress && status == 1) {

      //Migrate to different socket
      setBattleIdValidStatus(true);

      //Reload Battle Info
      console.log("Connection Permitted, requesting battle info");

      //Close Main and prep for battle websocket
      //io_main.close();
    } else if (userId === signedAddress && status == 0) {
      console.log('Failed to join battle: ', msg);
      setErrMsg(msg);
      setConnectingState(false);
    } else if (userId === signedAddress && status == -1) {
      console.log('Failed to join battle: ', msg);
      setErrMsg(msg);
      setConnectingState(false);
    }
  });

  useEffect(()=>{
    io_main.on('showResult', () => {
      router.push(`/result/${params.battleId}`);
    })

    io_main.on('disconnect', () => {
      router.push('/?notice=socketDisconnected');
    })
  },[])


  function delay(milliseconds: number): any {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  return (
    <main className='w-full min-h-screen overflow-x-hidden flex flex-col justify-center items-center bg-gradient-radial from-blue-950 to-blue-900'>
      {
        (isBattleIdValidated)
          ?
          <LobbyFragment params={{socket:io_main, address: signedAddress, battleId: params.battleId}} />
          :
          <div className="w-fit flex flex-col justify-normal items-center">
            <Image src={"/icons/Sword.png"} width={130} height={130} alt="" unoptimized={true} className="inline-block" />
            <p className="text-white mt-6 font-bold text-2xl">You have been invited by the organizer to a battle</p>
            <p className="text-orange-100 text-xl">Connect your wallet to verify your invitation</p>
            {
              (errMsg)
                ?
                <p className="text-red-400 text-lg">{`An error occur: ${errMsg}`}</p>
                :
                <span />
            }

            <div className="w-fit mt-10">
              {
                (signedAddress)
                  ?
                  <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg" onClick={connectToWebsocket} disabled={isConnecting}>{"Join lobby"}</button>
                  :
                  <button className="h-[50px] w-fit pl-6 pr-6 pt-2 pb-2 bg-blue-600 text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 rounded-lg flex flex-row justify-normal items-center" onClick={func_connectWallet}>{"Connect Ronin Wallet"}</button>
              }
            </div>

          </div>
      }


    </main>
  )
}