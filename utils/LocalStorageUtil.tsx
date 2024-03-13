export function getUserAddressToLocal(){
    if (typeof window !== "undefined"){
        return localStorage.getItem("user_address");
    }
}

export function setUserAddressToLocal(address : string){
    if (typeof window !== "undefined"){
        localStorage.setItem("user_address", address);
    }
}

export function removeUserAddressToLocal(){
    if (typeof window !== "undefined"){
        localStorage.removeItem("user_address");
    }
}

