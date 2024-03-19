import Image from "next/image";

export default function DraftingWaitingFragment() {
    return (
        <main className="w-full h-screen flex flex-col justify-center items-center">
            <Image src={"/icons/Sword.png"} width={130} height={130} alt="" unoptimized={true} className="inline-block" />
            <p className="text-white mt-6 font-bold text-2xl">Your enemy is still drafting axies</p>
            <p className="text-orange-100 text-xl">You chill out for a moment while still waiting</p>
        </main>
    );
}