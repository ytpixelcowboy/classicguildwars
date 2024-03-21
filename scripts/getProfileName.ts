interface ResultModel {
    data: {
        publicProfileWithRoninAddress: {
            name: string;
        };
    };
}


export default async function fetchProfileName(address: string) {
    try {
        const response = await fetch(`/api/getProfileName?address=${address}`);
        const data: ResultModel = await response.json();
        return data.data.publicProfileWithRoninAddress.name;
    } catch (error) {
        console.error('Error fetching player name:', error);
        return '-';
    }
}
