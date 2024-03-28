'use client'

import { forwardRef, ReactNode } from "react"

type Props = {
    header : string,
    children? : ReactNode,
}

export type Ref = HTMLDialogElement;

export default forwardRef<Ref, Props>(function DefaultMediumModal({ header, children}, ref) {
    return (
        <dialog ref={ref} className="w-[500px] bg-bg rounded-[15px]">
            <div className="h-[60px] w-full flex flex-row justify-start items-center pl-5 pr-5">
                <p className="text-white font-bold flex-1">{header}</p>
            </div>
            {children}
        </dialog>
    )
})