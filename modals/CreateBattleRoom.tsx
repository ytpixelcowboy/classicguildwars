'use client'

import { forwardRef, useState } from "react"

type Callback = (client1: string, client2: string) => void;

type Props = {
    onClose: () => void,
    callback: Callback,
}


export type Ref = HTMLDialogElement;

export default forwardRef<Ref, Props>(function DefaultMediumModal({ onClose, callback}, ref) {
    const [client1Address, setClient1Address] = useState<string>("");
    const [client2Address, setClient2Address] = useState<string>("");

    return (
        <dialog ref={ref} className="w-[500px] bg-bg rounded-[15px] border-fg-item border-4">
            <div className="h-[60px] w-full flex flex-row justify-start items-center pl-5 pr-5">
                <p className="text-white font-bold flex-1">{"Create new room"}</p>
                <button className="pl-6 pr-6 pt-2 pb-2 bg-orange-500 text-white rounded-lg drop-shadow-lg" onClick={onClose}>Close</button>
            </div>
            <div className="w-full h-fit">
                <div className="p-5 bg-fg">
                        <p className="text-base font-bold text-white ">Guild 1 address: </p>
                        <input className="w-full font-sans bg-sm-bg-light text-black p-3 border-solid border-item-bd border-2 rounded-lg mr-2" type="text" min={1} onChange={(event) => {
                            setClient1Address((event.target.value).toString());
                        }} />
                        <p className="text-base font-bold text-white ">Guild 2 address: </p>
                        <input className="w-full font-sans bg-sm-bg-light text-black p-3 border-solid border-item-bd border-2 rounded-lg mr-2" type="text" min={1} onChange={(event) => {
                            setClient2Address((event.target.value).toString());
                        }} />
                        <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-fg-shadow border-4 rounded-lg" onClick={()=>{
                        callback(client1Address, client2Address);
                    }}>{"Confirm"}</button>
                    </div>
            </div>
        </dialog>
    )
})