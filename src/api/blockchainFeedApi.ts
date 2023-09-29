import { ITVMMessage } from '@ylide/everscale';
import { IMessage, IMessageContent, IMessageCorruptedContent } from '@ylide/sdk';
import { useQuery } from 'react-query';

import { REACT_APP__BLOCKCHAIN_FEED } from '../env';
import { IMessageDecodedContent } from '../indexedDB/IndexedDB';
import { Community } from '../stores/communities/communities';
import { randomArrayElem } from '../utils/array';
import { invariant } from '../utils/assert';
import { decodeBroadcastContent } from '../utils/mail';
import { createCleanSerachParams } from '../utils/url';

export interface BlockchainFeedPost {
	id: string;
	createTimestamp: number;
	sender: string;
	meta: Exclude<ITVMMessage, 'key'> & { key: number[] };
	content: IMessageCorruptedContent | (Exclude<IMessageContent, 'content'> & { content: number[] }) | null;
	banned: boolean;
	blockchain: string;
	isAdmin?: boolean;
	addressReactions: Record<string, string | undefined>;
	reactionsCounts: Record<string, number | undefined>;
}

export interface DecodedBlockchainFeedPost {
	original: BlockchainFeedPost;
	msg: IMessage;
	decoded: IMessageDecodedContent;
}

export function decodeBlockchainFeedPost(p: BlockchainFeedPost): DecodedBlockchainFeedPost {
	const msg: IMessage = {
		...p.meta,
		key: new Uint8Array(p.meta.key),
	};

	const decoded = decodeBroadcastContent(
		msg.msgId,
		msg,
		p.content
			? p.content.corrupted
				? p.content
				: {
						...p.content,
						content: new Uint8Array(p.content.content),
				  }
			: null,
	);

	// if (decoded.decodedTextData.type === MessageDecodedTextDataType.YMF) {
	// 	decoded.decodedTextData.value.root.children.unshift({
	// 		parent: decoded.decodedTextData.value.root,
	// 		type: 'tag',
	// 		tag: 'reply-to',
	// 		attributes: {
	// 			id: 'yA1TeDLKGWN7Vk82NvYG7G5cq8d/S+Ef7R/oy7l8wJPaoQ==',
	// 		},
	// 		singular: true,
	// 		children: [],
	// 	});
	// }

	return {
		original: p,
		msg,
		decoded: decoded,
	};
}

//

export namespace BlockchainFeedApi {
	export function getUrl() {
		return (
			REACT_APP__BLOCKCHAIN_FEED ||
			randomArrayElem([
				'https://blockchain-feed1.ylide.io',
				'https://blockchain-feed2.ylide.io',
				'https://blockchain-feed3.ylide.io',
				'https://blockchain-feed4.ylide.io',
				'https://blockchain-feed5.ylide.io',
			])
		);
	}

	const url = getUrl();

	async function request<Data = string>(
		path: string,
		opts?: { query?: Record<string, any>; params?: RequestInit },
	): Promise<Data> {
		const query = Object.assign({}, opts?.query);

		const response = await fetch(`${url}${path}?${query ? createCleanSerachParams(query) : ''}`, opts?.params);
		invariant(response.status >= 200 && response.status < 300, 'Request failed');

		const text = await response.text();
		try {
			return JSON.parse(text) as Data;
		} catch (e) {}

		return text as Data;
	}

	//

	export async function getPostsStatus(params: { ids: string[] }) {
		return await request<{ bannedPosts: string[] }>('/posts-status', { query: { id: params.ids } });
	}

	export async function getAdmins(feedId: string) {
		return await request<string[]>('/admins', { query: { feedId } });
	}

	export async function isAdmin(feedId: string, address: string) {
		return await request('/is-admin', { query: { feedId, address } });
	}

	export async function banAddresses(params: { addresses: string[]; secret: string }) {
		return await request('/ban-addresses', {
			query: { secret: params.secret, address: params.addresses },
			params: { method: 'POST' },
		});
	}

	export async function unbanAddresses(params: { addresses: string[]; secret: string }) {
		return await request('/unban-addresses', {
			query: { secret: params.secret, address: params.addresses },
			params: { method: 'POST' },
		});
	}

	export async function banPost(params: { ids: string[]; secret: string }) {
		return await request('/v2/ban-posts', {
			query: { secret: params.secret, id: params.ids },
			params: { method: 'POST' },
		});
	}

	export async function approvePost(params: { ids: string[]; secret: string }) {
		return await request('/approve-posts', {
			query: { secret: params.secret, id: params.ids },
			params: { method: 'POST' },
		});
	}

	export async function unbanPost(params: { ids: string[]; secret: string }) {
		return await request('/unban-posts', {
			query: { secret: params.secret, id: params.ids },
			params: {
				method: 'DELETE',
			},
		});
	}

	export async function getPosts(params: {
		feedId: string;
		beforeTimestamp: number;
		adminMode?: boolean;
		addresses?: string[];
	}) {
		return await request<BlockchainFeedPost[]>('/v2/posts', {
			query: {
				feedId: params.feedId,
				beforeTimestamp: params.beforeTimestamp,
				adminMode: params.adminMode,
				address: params.addresses,
			},
		});
	}

	export async function getPost(params: { id: string; adminMode?: boolean; addresses?: string[] }) {
		return await request<BlockchainFeedPost | null>('/v2/post', {
			query: { id: params.id, adminMode: params.adminMode, address: params.addresses },
		});
	}

	export async function getTextIdea() {
		return await request<string>('/get-idea');
	}

	export async function getServiceStatus() {
		return await request<{ status: string }>('/service-status');
	}

	export async function startService(params: { secret: string }) {
		return await request('/start-service', {
			query: { secret: params.secret },
			params: { method: 'GET' },
		});
	}

	export async function stopService(params: { secret: string }) {
		return await request('/stop-service', {
			query: { secret: params.secret },
			params: { method: 'GET' },
		});
	}

	export async function getFeeds(params: { parentFeedId?: string }) {
		return await request('/feeds/', {
			query: { parentFeedId: params.parentFeedId },
			params: { method: 'GET' },
		});
	}

	export async function createFeed(params: {
		feedId: string;
		parentFeedId?: string;
		title: string;
		description: string;
		logoUrl: string;
	}) {
		return await request('/feeds/', {
			params: {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					feedId: params.feedId,
					parentFeedId: params.parentFeedId,
					title: params.title,
					description: params.description,
					logoUrl: params.logoUrl,
				}),
			},
		});
	}

	export async function updateFeed(params: {
		feedId: string;
		title?: string;
		description?: string;
		logoUrl?: string;
		comissions?: Record<string, string>;
	}) {
		return await request(`/feeds/${params.feedId}`, {
			params: {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					comissions: params.comissions,
					title: params.title,
					description: params.description,
					logoUrl: params.logoUrl,
				}),
			},
		});
	}

	export async function getCommissions(params: { feedId: string }): Promise<Record<string, string>[]> {
		const data = await request<Record<string, number>[]>(`/feeds/${params.feedId}/comissions`, {
			params: {
				method: 'GET',
			},
		});

		// Backend sends {string: number}, but front expects string
		return data.map(it => {
			Object.keys(it).forEach(key => {
				it[key] = String(it[key]) as any;
			});

			return it as any as Record<string, string>;
		});
	}

	export async function auth(body: { messageEncrypted: string; publicKey: string; address: string }) {
		return await request<{ token: string }>('/auth', {
			params: {
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				method: 'POST',
			},
		});
	}

	export async function setReaction({
		postId,
		reaction,
		authKey,
	}: {
		postId: string;
		reaction: string | null;
		authKey: string;
	}) {
		return await request('/reaction', {
			params: {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authKey}`,
				},
				body: JSON.stringify({ postId, reaction }),
				method: 'POST',
			},
		});
	}
}

export function useCommunityAdminsQuery(community: Community) {
	return useQuery(['community', community.id, 'admins'], {
		queryFn: () => BlockchainFeedApi.getAdmins(community.feedId.official || community.feedId.discussion!),
	});
}
