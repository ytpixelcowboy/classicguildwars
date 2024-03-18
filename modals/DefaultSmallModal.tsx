'use client'

import { forwardRef, ReactNode } from "react"

type Props = {
    header : string,
    children? : ReactNode,
    onClose: () => void,
    //children: React.ReactNode,
}

export type Ref = HTMLDialogElement;

export default forwardRef<Ref, Props>(function DefaultSmallModal({ header, children, onClose, }, ref) {
    return (
        <dialog ref={ref} className="w-[350px] bg-bg rounded-[15px] border-fg-item border-4">
            <div className="h-[60px] w-full flex flex-row justify-start items-center pl-5 pr-5">
                <p className="text-white font-bold flex-1">{header}</p>
                <button className="pl-6 pr-6 pt-2 pb-2 bg-orange-500 text-white rounded-lg drop-shadow-lg" onClick={onClose}>Close</button>
            </div>
            <div className="flex flex-col justify-items-center">
                {children}
            </div>
        </dialog>
    )
})