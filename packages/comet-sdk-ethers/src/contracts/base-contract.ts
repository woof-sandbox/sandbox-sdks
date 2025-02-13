import { Contract, Interface, InterfaceAbi, JsonRpcProvider } from 'ethers';

export class BaseContract {
    protected readonly contract: Contract;

    constructor(
        protected readonly provider: JsonRpcProvider,
        readonly address: string,
        abi: Interface | InterfaceAbi,
    ) {
        this.contract = new Contract(address, abi, provider);
    }

    get interface(): Interface {
        return this.contract.interface;
    }

}
