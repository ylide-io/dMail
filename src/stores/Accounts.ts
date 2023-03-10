import { IGenericAccount, YlideKey, YlideKeyStoreEvent } from '@ylide/sdk';
import { autobind } from 'core-decorators';
import { computed, makeObservable, observable } from 'mobx';

import { Domain } from './Domain';
import { DomainAccount } from './models/DomainAccount';

export class Accounts {
	@observable accounts: DomainAccount[] = [];

	private handlers: Record<string, ((domainAccount: DomainAccount) => void)[]> = {};
	public accountsProcessed = Promise.resolve();

	constructor(public readonly domain: Domain) {
		makeObservable(this);

		domain.keystore.on(YlideKeyStoreEvent.KEYS_UPDATED, this.handleKeysUpdate);
	}

	onceNewAccount(account: IGenericAccount, handler: (domainAccount: DomainAccount) => void) {
		this.handlers[account.address] = [...(this.handlers[account.address] || []), handler];
	}

	offNewAccount(account: IGenericAccount, handler: (domainAccount: DomainAccount) => void) {
		if (!this.handlers[account.address]) {
			return;
		}
		const idx = this.handlers[account.address].indexOf(handler);
		if (idx > -1) {
			this.handlers[account.address].splice(idx, 1);
		}
	}

	@autobind
	async handleKeysUpdate(keys: YlideKey[]) {
		this.accountsProcessed = new Promise(async resolve => {
			try {
				for (const key of keys) {
					const foundAccount = this.accounts.find(acc => acc.account.address === key.address);
					if (!foundAccount) {
						await this.addAccount(
							{
								address: key.address,
								publicKey: null,
								blockchain: key.blockchainGroup,
							},
							key,
							(await this.domain.storage.readString('yld1_accName_' + key.address)) || 'New Account',
						);
					}
				}
				for (const acc of this.accounts) {
					const foundKey = keys.find(k => k.address === acc.account.address);
					if (!foundKey) {
						await this.removeAccount(acc);
					}
				}
			} finally {
				resolve();
			}
		});
	}

	async addAccount(account: IGenericAccount, key: YlideKey, name: string) {
		const wallet = this.domain.wallets.find(w => w.factory.wallet === key.wallet);
		if (!wallet) {
			return;
		}

		const domainAccount = new DomainAccount(wallet, account, key, name);
		await domainAccount.init();

		wallet.accounts.push(domainAccount);
		this.accounts.push(domainAccount);

		// await this.domain.activateAccountReading(domainAccount);

		if (this.handlers[account.address]) {
			for (const handler of this.handlers[account.address]) {
				handler(domainAccount);
			}
			this.handlers[account.address] = [];
		}

		return domainAccount;
	}

	async removeAccount(account: DomainAccount) {
		const idx = this.accounts.indexOf(account);
		if (idx > -1) {
			this.accounts.splice(idx, 1);
		}
		const widx = account.wallet.accounts.indexOf(account);
		if (widx > -1) {
			account.wallet.accounts.splice(widx, 1);
		}
		await this.domain.keystore.delete(account.key);
	}

	@computed get activeAccounts() {
		return this.accounts.filter(a => a.isLocalKeyRegistered);
	}

	@computed get hasActiveAccounts() {
		return !!this.activeAccounts.length;
	}
}
