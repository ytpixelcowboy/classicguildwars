import { NextRequest, NextResponse } from 'next/server';

export async function GET(req : NextRequest) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    //myHeaders.append("X-API-Key", "2b6raX13oH4LtjzHsL1ckn8ZIuCZVBQd");

    const graphql = JSON.stringify({
        query: `query MyQuery {\r\n  publicProfileWithRoninAddress(roninAddress: "${req.nextUrl.searchParams.get('address')}") {\r\n    name\r\n  }\r\n}`,
        variables: {},
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow',
    };

    try {
        const response = await fetch("https://graphql-gateway.axieinfinity.com/graphql", requestOptions as any);
        //const response = await fetch("https://api-gateway.skymavis.com/graphql/marketplace", requestOptions as any);
        return NextResponse.json(await response.json())
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}

