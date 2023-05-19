import { EVMNetwork } from '@ylide/ethereum';
import { ExternalYlidePublicKey, IGenericAccount, ServiceCode, YlideCore, YlideKey } from '@ylide/sdk';
import { computed, makeAutoObservable, observable } from 'mobx';

import { isBytesEqual } from '../../utils/isBytesEqual';
import { Wallet } from './Wallet';

export class DomainAccount {
	readonly wallet: Wallet;
	readonly account: IGenericAccount;
	readonly key: YlideKey;
	readonly keyVersion: number;
	private _name: string;

	@observable remoteKey: ExternalYlidePublicKey | null = null;
	@observable remoteKeys: Record<string, ExternalYlidePublicKey | null> = {};
	@observable mainViewKey: string;

	constructor(wallet: Wallet, account: IGenericAccount, key: YlideKey, keyVersion: number, name: string) {
		makeAutoObservable(this);

		this.wallet = wallet;
		this.account = account;
		this.key = key;
		this.keyVersion = keyVersion;
		this._name = name;
		this.mainViewKey = this.getMainViewKey();
	}

	get name() {
		return this._name;
	}

	async rename(newName: string) {
		newName = newName.trim();
		if (newName.length > 255) {
			throw new Error('Max account length is 255');
		}
		this._name = newName;
		await this.wallet.domain.storage.storeString('yld1_accName_' + this.key.address, this._name);
	}

	appropriateBlockchains() {
		return this.wallet.domain.registeredBlockchains
			.filter(bc => bc.blockchainGroup === this.wallet.factory.blockchainGroup)
			.map(factory => ({
				factory,
				reader: this.wallet.domain.blockchains[factory.blockchain],
			}));
	}

	async getBalances(): Promise<Record<string, { original: string; numeric: number; e18: string }>> {
		return await this.wallet.getBalancesOf(this.account.address);
	}

	async init() {
		await this.readRemoteKeys();
	}

	private async readRemoteKeys() {
		const { remoteKeys, remoteKey } = await this.wallet.readRemoteKeys(this.account);
		this.remoteKeys = remoteKeys;
		this.remoteKey = remoteKey;
	}

	get uint256Address() {
		return this.wallet.controller.addressToUint256(this.account.address);
	}

	get sentAddress() {
		return YlideCore.getSentAddress(this.wallet.controller.addressToUint256(this.account.address));
	}

	@computed get isCurrentlySelected() {
		return this.wallet.isItCurrentAccount(this);
	}

	@computed get isAnyKeyRegistered() {
		return !!this.remoteKey;
	}

	@computed get isLocalKeyRegistered() {
		return this.remoteKey && isBytesEqual(this.key.keypair.publicKey, this.remoteKey.publicKey.bytes);
	}

	async attachRemoteKey(preferredNetwork?: EVMNetwork) {
		await this.wallet.controller.attachPublicKey(
			this.account,
			this.key.keypair.publicKey,
			this.keyVersion,
			ServiceCode.MAIL,
			{
				network: preferredNetwork,
			},
		);
	}

	async makeMainViewKey() {
		return await this.wallet.constructMainViewKey(this.account);
	}

	getMainViewKey() {
		this.mainViewKey = localStorage.getItem('yld1_mainViewKey_' + this.account.address) || '';
		return this.mainViewKey;
	}

	setMainViewKey(key: string) {
		this.mainViewKey = key;
		localStorage.setItem('yld1_mainViewKey_' + this.account.address, key);
	}
}
