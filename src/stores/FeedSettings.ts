import { autorun, makeObservable, observable } from 'mobx';

import { FeedManagerApi } from '../api/feedManagerApi';
import { FeedServerApi, FeedSource } from '../api/feedServerApi';
import domain from './Domain';
import { DomainAccount } from './models/DomainAccount';

export interface FeedSettingsData {
	mode: FeedManagerApi.ConfigMode;
	includedSourceIds: string[];
	excludedSourceIds: string[];
	defaultProjects: FeedManagerApi.UserProject[];
}

export class FeedSettings {
	@observable
	isError = false;

	@observable.shallow
	sources: FeedSource[] = [];

	@observable
	private configs = new Map<DomainAccount, FeedSettingsData | 'loading'>();

	@observable
	coverage: FeedManagerApi.GetCoverageResponse | 'loading' | 'error' = 'loading';

	constructor() {
		makeObservable(this);

		FeedServerApi.getSources()
			.then(({ sources }) => (this.sources = sources))
			.catch(() => (this.isError = true));

		autorun(() => {
			domain.accounts.activeAccounts
				.filter(account => account.mainViewKey && !this.configs.has(account))
				.forEach(async account => {
					try {
						this.configs.set(account, 'loading');

						const [configResponse, coverageResponse] = await Promise.allSettled([
							FeedManagerApi.getConfig({ token: account.mainViewKey }),
							FeedManagerApi.getCoverage(account.mainViewKey),
						]);
						if (configResponse.status === 'fulfilled') {
							const { config, defaultProjects } = configResponse.value;
							this.configs.set(account, {
								mode: config.mode,
								includedSourceIds: config.includedSourceIds,
								excludedSourceIds: config.excludedSourceIds,
								defaultProjects: defaultProjects,
							});
						} else {
							this.isError = true;
							console.log(`Failed to get config - ${configResponse.reason}`);
						}
						if (coverageResponse.status === 'fulfilled') {
							this.coverage = coverageResponse.value;
						} else {
							this.coverage = 'error';
							console.log(`Failed to get coverage - ${coverageResponse.reason}`);
						}
					} catch (e) {
						this.isError = true;
					}
				});
		});
	}

	getAccountConfig(account: DomainAccount): FeedSettingsData | undefined {
		const config = this.configs.get(account);
		if (config && config !== 'loading') return config;
	}

	getSelectedSourceIds(account: DomainAccount) {
		const config = this.getAccountConfig(account);
		if (!config) return [];

		const defaultProjectIds = config.defaultProjects.map(p => p.projectId);

		return this.sources
			.filter(source =>
				source.cryptoProject?.id && defaultProjectIds.includes(source.cryptoProject.id)
					? !config.excludedSourceIds.includes(source.id)
					: config.includedSourceIds.includes(source.id),
			)
			.map(s => s.id);
	}

	isSourceSelected(account: DomainAccount, sourceId: string) {
		return this.getSelectedSourceIds(account).includes(sourceId);
	}

	async updateFeedConfig(account: DomainAccount, selectedSourceIds: string[]) {
		const config = this.getAccountConfig(account);
		if (!config) return;

		const defaultProjectIds = config.defaultProjects.map(p => p.projectId);

		config.excludedSourceIds = this.sources
			.filter(
				source =>
					!selectedSourceIds.includes(source.id) &&
					source.cryptoProject?.id &&
					defaultProjectIds.includes(source.cryptoProject.id),
			)
			.map(s => s.id);

		config.includedSourceIds = this.sources
			.filter(
				source =>
					selectedSourceIds.includes(source.id) &&
					(!source.cryptoProject?.id || !defaultProjectIds.includes(source.cryptoProject.id)),
			)
			.map(s => s.id);

		await FeedManagerApi.setConfig({
			token: account.mainViewKey,
			config: {
				mode: config.mode,
				excludedSourceIds: config.excludedSourceIds,
				includedSourceIds: config.includedSourceIds,
			},
		});
	}
}

export const feedSettings = new FeedSettings();
