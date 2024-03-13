let regex_address = /^(ronin:|0x)[a-zA-Z0-9]{12,}$/;
let regex_rns = /^[a-zA-Z0-0]{4,}(.ron|.RON)$/;
let regex_uid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidAddress(address : String) : boolean{
    return regex_address.test(address as string);
}

export function isValidRNS(rns : String) : boolean{
    return regex_rns.test(rns as string);
}

export function isValidUUID(playerId : String) : boolean{
    return regex_uid.test(playerId as string);
}