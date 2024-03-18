'use client'

import { forwardRef, ReactNode } from "react"

type Props = {
    header : string,
    children? : ReactNode,
    onClose: () => void,
    //children: React.ReactNode,
}

export type Ref = HTMLDialogElement;

export default forwardRef<Ref, Props>(function MenuSmallModal({ header, children, onClose, }, ref) {
    return (
        <dialog ref={ref} className="w-[350px] bg-sm-fg rounded-[15px]">
            <div className="h-[60px] w-full flex flex-row justify-start items-center pl-5 pr-5">
                <p className="text-white font-bold flex-1">{header}</p>
            </div>
            <div className="flex flex-col justify-items-center p-[20px]">
                {children}
            </div>
        </dialog>
    )
})