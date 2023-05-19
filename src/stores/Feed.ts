import { makeObservable, observable } from 'mobx';

import { FeedCategory, FeedPost, FeedServerApi, FeedSourceUserRelation } from '../api/feedServerApi';
import { randomArrayElem } from '../utils/array';
import { analytics } from './Analytics';
import { browserStorage } from './browserStorage';

export const nonSyntheticFeedCategories = Object.values<FeedCategory>(FeedCategory).filter(
	it => it !== FeedCategory.MAIN && it !== FeedCategory.ALL,
);

export function getFeedCategoryName(category: FeedCategory) {
	if (category === FeedCategory.MAIN) {
		return 'Smart feed';
	} else if (category === FeedCategory.ALL) {
		return 'All topics';
	} else {
		return category;
	}
}

const FEED_PAGE_SIZE = 10;

export class FeedStore {
	@observable posts: FeedPost[] = [];

	@observable loaded = false;
	@observable loading = false;
	@observable error: boolean | FeedServerApi.ErrorCode = false;

	@observable newPosts = 0;
	@observable moreAvailable = false;

	readonly category: FeedCategory | undefined;
	readonly sourceId: string | undefined;
	readonly addressTokens: string[] | undefined;

	constructor(params: { category?: FeedCategory; sourceId?: string; addressTokens?: string[] }) {
		this.category = params.category;
		this.sourceId = params.sourceId;
		this.addressTokens = params.addressTokens;

		makeObservable(this);
	}

	private async genericLoad(
		params: {
			needOld: boolean;
			length: number;
			lastPostId?: string;
			firstPostId?: string;
		},
		isRetryWithNewSourceList: boolean = false,
	): Promise<FeedServerApi.GetPostsResponse | undefined> {
		try {
			this.loading = true;

			const sourceListId =
				this.category === FeedCategory.MAIN && !this.sourceId
					? browserStorage.feedSourceSettings?.listId
					: undefined;

			const categories =
				this.sourceId || sourceListId || !this.category
					? undefined
					: this.category === FeedCategory.MAIN
					? nonSyntheticFeedCategories
					: this.category === FeedCategory.ALL
					? nonSyntheticFeedCategories
					: [this.category];

			const response = await FeedServerApi.getPosts({
				...params,
				categories,
				sourceListId,
				addressTokens: this.addressTokens,
			});

			// FIXME Temp
			response.items.forEach(it => {
				// NONE = 'NONE',
				// HOLDING_TOKEN = 'HOLDING_TOKEN',
				// HELD_TOKEN = 'HELD_TOKEN',
				// USING_PROJECT = 'USING_PROJECT',
				// USED_PROJECT = 'USED_PROJECT',
				// it.tokens = [randomArrayElem(['BTC', 'ETH', 'USDT'])];
				// it.userRelation = randomArrayElem(Object.values(FeedSourceUserRelation));
				it.tokens = it.cryptoProjectName ? [it.cryptoProjectName] : [];
				if (it.cryptoProjectReasons.includes('balance')) {
					it.userRelation = FeedSourceUserRelation.HOLDING_TOKEN;
				} else if (it.cryptoProjectReasons.includes('protocol')) {
					it.userRelation = FeedSourceUserRelation.USING_PROJECT;
				} else if (it.cryptoProjectReasons.includes('transaction')) {
					it.userRelation = FeedSourceUserRelation.USED_PROJECT;
				} else {
					it.userRelation = FeedSourceUserRelation.NONE;
				}
			});

			this.loaded = true;
			this.error = false;

			if (params.needOld && this.category) {
				analytics.feedPageLoaded(this.category, Math.floor(this.posts.length / FEED_PAGE_SIZE) + 1);
			}

			return response;
		} catch (e) {
			if (e instanceof FeedServerApi.FeedServerError) {
				if (e.code !== FeedServerApi.ErrorCode.SOURCE_LIST_NOT_FOUND) {
					this.error = e.code;
					return;
				} else if (!isRetryWithNewSourceList) {
					const sourceIds = browserStorage.feedSourceSettings?.sourceIds;
					if (sourceIds) {
						try {
							const data = await FeedServerApi.createSourceList(sourceIds);
							browserStorage.feedSourceSettings = {
								listId: data.sourceListId,
								sourceIds,
							};

							return await this.genericLoad(params, true);
						} catch (e) {}
					}
				}
			}

			this.error = true;
		} finally {
			this.loading = false;
		}
	}

	async load() {
		if (this.loading) return;

		const data = await this.genericLoad({
			needOld: true,
			length: FEED_PAGE_SIZE,
		});

		if (data) {
			this.posts = data.items;
			this.moreAvailable = data.moreAvailable;
			this.newPosts = data.newPosts;
		}
	}

	async loadMore() {
		if (this.loading) return;

		const data = await this.genericLoad({
			needOld: true,
			length: FEED_PAGE_SIZE,
			lastPostId: this.posts.at(-1)?.id,
			firstPostId: this.posts.at(0)?.id,
		});

		if (data) {
			this.posts.push(...data.items);
			this.moreAvailable = data.moreAvailable;
			this.newPosts = data.newPosts;
		}
	}

	async loadNew() {
		if (this.loading) return;

		const data = await this.genericLoad({
			needOld: false,
			length: FEED_PAGE_SIZE,
			lastPostId: this.posts.at(-1)?.id,
			firstPostId: this.posts.at(0)?.id,
		});

		if (data) {
			this.posts.unshift(...data.items);
			this.newPosts = 0;
		}
	}
}
