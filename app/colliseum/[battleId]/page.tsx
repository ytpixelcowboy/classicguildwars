'use client'

import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"
import { checkIfConnected, connectRoninWallet } from "@/utils/ConnectWallet";
import { getUserAddressToLocal } from "@/utils/LocalStorageUtil";
import DraftinFragment from "@/components/DraftingFragment";
import DraftingFragment from "@/components/DraftingFragment";
import BanningFragment from "@/components/BanningFragment";
import dynamic from "next/dynamic";

import { env } from "process";
import DraftingWaitingFragment from "@/components/DraftingWaitingFragment";

interface SocketResponse {
  intent: string,
  msg?: string,
  status?: number,
  battleId: string,
  userId: string,
  data: BattleInfo | any,
}

interface BattleInfo {
  battleId: string,
  status: number,
  phase: number,
  createdBy: string,
  startedAt: number,
  endedAt: number,
  client1: ClientInfo,
  client2: ClientInfo
}

interface ClientInfo {
  address: string,
  status: number,
  hasAxiesDrafted: boolean,
  isBanTurn: boolean,
  timeBank: number,
  axies: string[],
  bannedAxies: string[],
}

export default function InvitationPage({ params }: { params: { battleId: string } }) {
  const router = useRouter();

  //Connectivity Controller
  var [isBattleIdValidated, setBattleIdValidStatus] = useState<boolean>();
  var [progress, setProgress] = useState<number>(0);

  const [clientAddress, setClient_address] = useState<string>("");
  const [client2Address, setClient2_address] = useState<string>("");

  var [errMsg, setErrMsg] = useState<string>();
  var [isConnecting, setConnectingState] = useState<boolean>(false);
  var [address, setAddress] = useState<string | any>();

  const [hasAxiesDrafted, setHasAxiesDrafted] = useState<boolean>(false);
  const [hasBothClientDrafted, setHasBothClientDrafted] = useState<boolean>();

  function func_connectWallet() {
    console.log("Is wallet connected: " + checkIfConnected())

    connectRoninWallet().then(() => {
      setAddress(getUserAddressToLocal())
    });
  }

  function connectToWebsocket() {
    const socket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS}`);

    setConnectingState(true);

    socket.addEventListener('open', (event) => {
      console.log("Connected.")

      socket.send(JSON.stringify({
        intent: "joinBattle",
        battleId: params.battleId,
        userId: getUserAddressToLocal()
      }));

    })

    socket.addEventListener('message', async (event) => {
      let isBattleIdValid = false;

      const res: SocketResponse = JSON.parse(event.data);

      if (res.intent === "permitJoin" && res.userId === getUserAddressToLocal() && res.status == 1) {
        console.log("Connection Permitted");
        socket.send(JSON.stringify({
          'intent': 'ping',
          'battleId': params.battleId,
          "userId": getUserAddressToLocal()
        }));

        //Reload Battle Info
        requestBattleInfo();

        setBattleIdValidStatus(true);
        isBattleIdValid = true;
      } else if (res.intent === "permitJoin" && res.userId === getUserAddressToLocal() && res.status == 0) {
        console.log('Failed to join battle: ', res.msg);
        setErrMsg(res.msg);
        setConnectingState(false);
      } else if (res.intent === "permitJoin" && res.userId === getUserAddressToLocal() && res.status == -1) {
        console.log('Failed to join battle: ', res.msg);
        setErrMsg(res.msg);
        setConnectingState(false);
      }

      
      //Check battle state
      if (isBattleIdValid) {
        console.log("Page Controller 1: " + JSON.stringify(res))

        if (res.intent == "resultBattleInfo" && res.battleId == params.battleId) {
          const data = res.data as BattleInfo;

          console.log("Page Controller 2: " + JSON.stringify(res))
          setProgress(res.data?.phase!);

          console.log("Page Controller: this user is client1 : Server" + data.client1.address + " Local: " + getUserAddressToLocal())
          console.log("Page Controller: this user is client2 : Server" + data.client1.address + " Local: " + getUserAddressToLocal())

          //Check if this client is client1 in the server
          if (data.client1.address == getUserAddressToLocal()) {
            setClient_address(data.client1.address!);
            setClient2_address(data.client2.address!);

            //Set this client drafting status and turn on waiting screen
            setHasAxiesDrafted(data.client1.hasAxiesDrafted);

            //Checks if this use has to wait for the other one
            if (data.client1.hasAxiesDrafted && data.client2.hasAxiesDrafted) {
              setHasBothClientDrafted(true);
            }
          }

          //Check if this client is client2 in the server
          if (data.client2.address == getUserAddressToLocal()) {
            setClient_address(data.client2.address);
            setClient2_address(data.client1.address);

            //Set this client drafting status and turn on waiting screen
            setHasAxiesDrafted(data.client2.hasAxiesDrafted);

            //Checks if this use has to wait for the other one
            if (data.client1.hasAxiesDrafted && data.client2.hasAxiesDrafted) {
              setHasBothClientDrafted(true);
            }
          }

          //TODO
        }
      }
    })

    socket.addEventListener('close', (event) => {
      router.refresh();
    })

    function delay(milliseconds: number): any {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function requestBattleInfo(){
      if(socket.OPEN){
          socket.send(JSON.stringify({
              'battleId': params.battleId,
              'intent': 'battleInfo',
              'userId' : getUserAddressToLocal()
          }));
      }
  }
  }

  return (
    <main className='flex min-h-screen flex-col justify-center items-center bg-gradient-radial from-blue-950 to-blue-900 p-10'>
      {
        (isBattleIdValidated)
          ?
          <div className="w-full h-full flex flex-col justify-normal items-center">
            <div className="w-full h-[40px] flex flex-row justify-between items-center">
              <div className="min-w-[200px] max-w-[250px] h-full bg-blue-600 rounded-lg text-white overflow-x-auto p-2">
                <p>{clientAddress}</p>
              </div>
            </div>
            <div className="w-full h-full xl:w-[1280px]">
              <div className="flex flex-row justify-center items-center mb-10">
                <div className="min-w-[200px] flex flex-row items-center">
                  <Image src={"/icons/free.png"} height={50} width={50} alt={""} unoptimized={true} />
                  <div className="flex flex-col justify-start ml-5">
                    <p>Axie Drafting</p>
                    <div className={`w-full mt-2 p-1  ${(progress == 0) ? 'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`} />
                  </div>
                </div>
                <div className="min-w-[200px] flex flex-row items-center">
                  <Image src={"/icons/banned.png"} height={50} width={50} alt={""} unoptimized={true} />
                  <div className="flex flex-col justify-start ml-5">
                    <p>Banning Phase</p>
                    <div className={`w-full mt-2  p-1  ${(progress == 1) ? 'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`} />
                  </div>
                </div>
              </div>
              <div>
                {
                  (progress == 0 && !hasAxiesDrafted)
                    ?
                    <DraftingFragment params={{ battleId: params.battleId, address: clientAddress, client2_address: client2Address }} />
                    :
                    (progress == 0 && hasAxiesDrafted)
                      ?
                      <DraftingWaitingFragment />
                      :
                      <BanningFragment params={{ battleId: params.battleId, address: address }} />
                }
              </div>
            </div>
          </div>

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
                (address != null)
                  ?
                  <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg" onClick={connectToWebsocket} disabled={isConnecting}>{"Join lobby"}</button>
                  :
                  <button className="h-[50px] w-fit pl-6 pr-6 pt-2 pb-2 bg-blue-600 text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 rounded-lg flex flex-row justify-normal items-center" onClick={func_connectWallet}>{"Connect Ronin Wallet"}</button>
              }
            </div>

          </div>
      }


    </main>
  )
}