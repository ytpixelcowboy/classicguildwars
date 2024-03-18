import { NextRequest, NextResponse } from "next/server";


export async function GET(req : NextRequest){
    try{
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_WS_IP}/livebattles`);
        return NextResponse.json(await response.json());
    }catch(error){
        return NextResponse.json({status : "err", msg: error});    
    }
}