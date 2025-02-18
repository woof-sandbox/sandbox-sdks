import { Contract, Interface, InterfaceAbi, JsonRpcProvider } from 'ethers';

export class BaseContract {
    protected readonly contract: Contract;
    public readonly isCallable: boolean;

    constructor(
        abi: Interface | InterfaceAbi,
        readonly address: string = '0x0000000000000000000000000000000000000000',
        protected readonly provider?: JsonRpcProvider,
    ) {
        this.isCallable = !!address && !!provider;
        this.contract = new Contract(address, abi, provider);
    }

    get interface(): Interface {
        return this.contract.interface;
    }

}
