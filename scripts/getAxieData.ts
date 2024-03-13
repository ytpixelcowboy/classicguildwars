interface ResultData {
    data: {
        axies: {
            results: Axie[];
        };
    };
}

interface Axie {
    id: string;
    name: string;
    image: string;
    class: string;
}

export default async function getAxieData(address: string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-API-Key", "phe9se7cCrpTKd8FtWrPa5ECv3mPrr9a");

    const graphql = JSON.stringify({
        query: `query GetAxies {
            axies(owner: "${address}", size: 100) {
                results {
                    class
                    id
                    image
                    name
                    owner
                }
            }
        }`,
        variables: {},
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow',
    };

    try {
        const response = await fetch("https://api-gateway.skymavis.com/graphql/marketplace", requestOptions as any);
        const result = await response.json();
        return result.data.axies.results as Axie[];
    } catch (error) {
        console.error(error);
        return [] as Axie[];
    }
}
