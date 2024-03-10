'use client'

import { useState, useEffect } from "react"

export default function Drafting() {

    var [progress, setProgress] = useState<number>(1);

    return (
        <main className="min-h-screen flex flex-col justify-normal p-24 bg-bg-sub">
            <div className="flex flex-col justify-center items-center mb-10">
                <div className="w-full md:w-[400px] h-[30px] flex flex-row justify-center items-center">
                    <div className="flex-1 flex-col justify-start mr-5">
                        <p>Axie Drafting</p>
                        <div className={`w-full mt-2 p-1  ${(progress == 0)?'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`}/>
                    </div>
                    <div className="flex-1 flex-col justify-start ml-5">
                        <p>Banning Phase</p>
                        <div className={`w-full mt-2  p-1  ${(progress == 1)?'bg-yellow-500' : 'bg-yellow-100'} rounded-2xl`}/>
                    </div>
                </div>
            </div>

            {
                (progress == 0)
                ?
                <div>
                    <p className="text-4xl font-bold mb-5">Axie Drafting</p>
                    <p className="text-xl text-gray-200">Select 10 axies that you want to draft pick.</p>
                    <p className="text-xl text-gray-200">Note: Your enemy can ban X axies after the draft pick phase</p>

                    <div className="w-full min-h-96 mt-5 p-5 bg-fg-shadow rounded-lg">

                    </div>
                </div>
                :
                <div>
                    <p className="text-4xl font-bold mb-5">Banning Phase</p>
                    <p className="text-xl text-gray-200">Select X axies from your enemy draft picks</p>

                    <div className="w-full min-h-96 mt-5 p-5 bg-fg-shadow rounded-lg">

                    </div>
                </div>
            }
        </main>
    )
}