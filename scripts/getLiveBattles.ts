interface ResponseModel{
    items : LiveBatles[]
}

interface LiveBatles{
    battleId : string,
    status : number,
    phase : number,
    createdBy: string,
    startedAt : number,
    endedAt : number,
    client1 : BattleClient,
    client2 : BattleClient
}

interface BattleClient{
    address: string,
    status: number,
    isBanTurn: boolean,
    timeBank: number,
    axies: string[],
    bannedAxies: BannedAxiesModel[],
}

interface BannedAxiesModel{
    axieId : string,
    isBanned : string,
}

export default async function fetchLiveBattles() : Promise<LiveBatles[]>{
    try {
        const response = await fetch("/api/getLiveBattles");
        const result = await response.json() as ResponseModel;
        return result.items as LiveBatles[];
    } catch (error) {
        console.error(error);
        return [] as LiveBatles[];
    }
}