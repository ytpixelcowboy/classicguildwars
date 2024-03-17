import { NextRequest, NextResponse } from "next/server";


export async function GET(req : NextRequest){
    try{
        const response = await fetch("http://192.168.68.102:4000/livebattles");
        return NextResponse.json(await response.json());
    }catch(error){
        return NextResponse.json({status : "err", msg: error});    
    }
}