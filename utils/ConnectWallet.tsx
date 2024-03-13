import { ethers } from "ethers";
import { WalletSDK } from "@roninnetwork/wallet-sdk"
import { getUserAddressToLocal, setUserAddressToLocal, removeUserAddressToLocal } from "./LocalStorageUtil";

const sdk = new WalletSDK({
    mobileOptions: {
        walletConnectProjectId: '43dcd9a3a8f0aff2e99316903415bec2',
        useDeeplink: false
    },
    dappMetadata: {
        url: "https://wallet.roninchain.com",
        icon: 'https://example-dapp/assets/logo.png',
        name: 'My Axie Buddy',
        description: 'This is a test dApp',
    }
})

export function checkRoninInstalled() {
    if ('ronin' in window) {
        return true
    }

    window.open('https://wallet.roninchain.com', '_blank')
    return false
}


export async function connectRoninWallet() {

    await sdk.connectInjected();

    const isInstalled = checkRoninInstalled()
    if (isInstalled === false) {
        return;
    }

    const accounts = await sdk.requestAccounts();
    if (accounts) {
        setUserAddressToLocal(accounts[0]);
        return getUserAddressToLocal();
    }
}

export function checkIfConnected() {
    //console.log(getUserAddressToLocal()?.toString);
    const address = getUserAddressToLocal()?.toString;

    return address != undefined || address != null;
}

export async function disconnectRoninWallet(){
    removeUserAddressToLocal();
    await sdk.disconnect();
}

//