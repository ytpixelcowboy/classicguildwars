export default function AdminDashboard(){
    return (
        <main className="min-h-screen flex flex-col justify-normal p-24 bg-bg-sub">
            <div className="w-full h-[60px] bg-fg-item p-5 flex flex-row rounded-md">
                <div className="flex-1 flex-row justify-normal items-center">
                    <p>Admin Dashboard</p>
                </div>
                <div className="flex flex-row justify-end items-end">
                    <button className="h-[50px] w-[200px] pl-6 pr-6 pt-2 pb-2 bg-fg text-white rounded-item-bd drop-shadow-lg disabled:bg-gray-600 disabled:text-gray-400 border-bg border-4 rounded-lg">{"Create Invitation"}</button>
                </div>
            </div>

            <div className="w-full mt-5 p-5 bg-fg rounded-lg">

            </div>
        </main>
    )
}