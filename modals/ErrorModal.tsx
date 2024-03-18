'use client'

import Image from "next/image";
import { forwardRef, ReactNode } from "react"

type Props = {
    children? : ReactNode,
    header : string,
    onClose: () => void,
    //children: React.ReactNode,
}

export type Ref = HTMLDialogElement;

export default forwardRef<Ref, Props>(function ErrorModal({ header, children, onClose, }, ref) {
    return (
        <dialog ref={ref} className="w-[400px] bg-fg rounded-lg border-fg-item border-4">
            <div className="w-full h-[50px] pl-5 flex justify-start items-center rounded-tl-lg rounded-tr-lg bg-red-400">
                <p className="text-white font-bold">{header}</p>
            </div>
            {children}
        </dialog>
    )
})