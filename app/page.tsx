import Image from "next/image";

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col justify-center items-center p-24 bg-bg-sub'>
      <div className="w-fit flex flex-col justify-normal items-center">
        <Image src={"/icons/Sword.png"} width={130} height={130} alt="" unoptimized={true} className="inline-block" />
        <p className="mt-5 text-white font-bold text-6xl">Classic Guild Wars</p>

        <div className="w-fit mt-20">
          <p className="text-white font-semibold text-lg">Enter battle invitation id</p>
          <div className="flex flex-row">
            <input className="w-full font-sans bg-sm-bg-light text-white p-3 border-solid border-item-bd border-4 rounded-lg mr-2" type="number" placeholder="8278299" min={1} ></input>
            <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg">{"Join lobby"}</button>
          </div>
        </div>
      </div>
    </main>
  )
}
