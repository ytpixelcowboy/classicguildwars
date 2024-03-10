import Image from "next/image"

export default function InvitationPage() {
  return (
    <main className='flex min-h-screen flex-col justify-center items-center p-24 bg-bg-sub'>
      <div className="w-fit flex flex-col justify-normal items-center">
        <Image src={"/icons/Sword.png"} width={130} height={130} alt="" unoptimized={true} className="inline-block" />
        <p className="text-white mt-6 font-bold text-2xl">You have been invited by the organizer to a battle</p>
        <p className="text-orange-100 text-xl">Connect your wallet to verify your invitation</p>

        <button className="h-[50px] w-fit mt-9 pl-6 pr-6 pt-2 pb-2 bg-blue-600 text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 rounded-lg">{"Connect Ronin Wallet"}</button>
      </div>
    </main>
  )
}