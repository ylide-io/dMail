import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { generatePath, useParams } from 'react-router-dom';

import { FeedServerApi } from '../../../api/feedServerApi';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../../components/ActionButton/ActionButton';
import { CoverageModal } from '../../../components/coverageModal/coverageModal';
import { ErrorMessage, ErrorMessageLook } from '../../../components/errorMessage/errorMessage';
import { NarrowContent } from '../../../components/genericLayout/content/narrowContent/narrowContent';
import { GenericLayout, useGenericLayoutApi } from '../../../components/genericLayout/genericLayout';
import { AppMode, REACT_APP__APP_MODE, VAPID_PUBLIC_KEY } from '../../../env';
import { ReactComponent as ArrowUpSvg } from '../../../icons/ic20/arrowUp.svg';
import { ReactComponent as CrossSvg } from '../../../icons/ic20/cross.svg';
import domain from '../../../stores/Domain';
import { FeedStore } from '../../../stores/Feed';
import { feedSettings } from '../../../stores/FeedSettings';
import { RoutePath } from '../../../stores/routePath';
import { connectAccount } from '../../../utils/account';
import { hookDependency } from '../../../utils/react';
import { truncateInMiddle } from '../../../utils/string';
import { useNav } from '../../../utils/url';
import { FeedPostItem } from '../_common/feedPostItem/feedPostItem';
import css from './feedPage.module.scss';
import ErrorCode = FeedServerApi.ErrorCode;
import { FeedManagerApi } from '../../../api/feedManagerApi';
import { SimpleLoader } from '../../../components/simpleLoader/simpleLoader';
import { analytics } from '../../../stores/Analytics';

const reloadFeedCounter = observable.box(0);

export function reloadFeed() {
	reloadFeedCounter.set(reloadFeedCounter.get() + 1);
}

//

const FeedPageContent = observer(() => {
	const navigate = useNav();
	const accounts = domain.accounts.activeAccounts;
	const genericLayoutApi = useGenericLayoutApi();
	const tags = feedSettings.tags;

	const [showCoverageModal, setShowCoverageModal] = useState(false);

	const { tag, source, address } = useParams<{ tag: string; source: string; address: string }>();

	const selectedAccounts = useMemo(
		() => (address ? accounts.filter(a => a.account.address === address) : !tag && !source ? accounts : []),
		[accounts, address, tag, source],
	);

	const coverage = feedSettings.coverages.get(selectedAccounts[0]);
	const totalCoverage = useMemo(() => {
		if (!coverage || coverage === 'error' || coverage === 'loading') {
			return null;
		}
		return coverage.totalCoverage;
	}, [coverage]);

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
		const rawData = atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	const grantPushForAll = useCallback(() => {
		if (accounts.every(a => a.mainViewKey)) {
			navigator.serviceWorker
				.getRegistration()
				.then(registration =>
					registration?.pushManager.subscribe({
						applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
						userVisibleOnly: true,
					}),
				)
				.then(
					subscription =>
						subscription &&
						Promise.all(accounts.map(a => FeedManagerApi.subscribe(a.mainViewKey, subscription))),
				);
		}
	}, [accounts]);

	useEffect(() => {
		if (accounts.length >= 1 && accounts.every(a => a.mainViewKey)) {
			navigator?.permissions?.query({ name: 'notifications' }).then(r => {
				if (r.state === 'prompt') {
					console.log('Request notification permission');
					Notification.requestPermission().then(result => {
						if (result === 'granted') {
							grantPushForAll();
						}
					});
				} else if (r.state === 'granted') {
					console.log('Grant permission for all wallets');
					grantPushForAll();
				} else if (r.state === 'denied') {
					console.log('Revoke permission for all wallets');
					Promise.all(accounts.map(a => FeedManagerApi.subscribe(a.mainViewKey, null)));
				}
			});
		}
	}, [accounts, grantPushForAll]);

	useEffect(() => {
		if (address && !selectedAccounts.length) {
			navigate(generatePath(RoutePath.FEED));
		}
	}, [address, navigate, selectedAccounts]);

	// We can NOT load smart feed if no suitable account connected
	const canLoadFeed =
		!!tag ||
		(!!accounts.length && (REACT_APP__APP_MODE !== AppMode.MAIN_VIEW || accounts.every(a => a.mainViewKey)));

	const reloadCounter = reloadFeedCounter.get();

	const feed = useMemo(() => {
		hookDependency(reloadCounter);

		const feed = new FeedStore({
			// TODO: KONST
			tags: tags !== 'error' && tags !== 'loading' ? tags.filter(t => t.id === Number(tag)) : [],
			sourceId: source,
			addressTokens: selectedAccounts.map(a => a.mainViewKey),
		});

		genericLayoutApi.scrollToTop();

		if (canLoadFeed) {
			feed.load();
		}

		return feed;
	}, [canLoadFeed, tags, tag, genericLayoutApi, selectedAccounts, source, reloadCounter]);

	useEffect(() => {
		return () => {
			feed.clearProcess();
		};
	}, [feed]);

	const title = useMemo(() => {
		if (tag) {
			return feed.tags.find(t => t.id === Number(tag))?.name;
		}
		if (feed.tags.length === 1 && feed.tags[0].name) {
			return feed.sourceId;
		}
		if (selectedAccounts.length === 1 && address) {
			return `Feed for ${
				selectedAccounts[0].name
					? selectedAccounts[0].name
					: truncateInMiddle(selectedAccounts[0].account.address, 8, '..')
			}`;
		}
		return 'Smart feed';
	}, [feed, selectedAccounts, address, tag]);

	return (
		<NarrowContent
			title={title}
			titleSubItem={
				!!source && (
					<ActionButton
						look={ActionButtonLook.PRIMARY}
						icon={<CrossSvg />}
						onClick={() => navigate(generatePath(RoutePath.FEED))}
					>
						Clear filter
					</ActionButton>
				)
			}
			titleRight={
				<div className={css.buttons}>
					{!!feed.newPosts && (
						<ActionButton look={ActionButtonLook.SECONDARY} onClick={() => feed.loadNew()}>
							Show {feed.newPosts} new posts
						</ActionButton>
					)}
					{feed.tags.length === 0 &&
						!feed.sourceId &&
						selectedAccounts.length === 1 &&
						address &&
						totalCoverage && (
							<ActionButton
								look={ActionButtonLook.PRIMARY}
								onClick={() => {
									setShowCoverageModal(true);
									analytics.mainviewCoverageClick(address);
								}}
							>
								USD Coverage: {totalCoverage}
							</ActionButton>
						)}
				</div>
			}
		>
			{showCoverageModal && coverage && coverage !== 'error' && coverage !== 'loading' && (
				<CoverageModal onClose={() => setShowCoverageModal(false)} coverage={coverage} />
			)}
			{!!feed.posts.length && (
				<ActionButton
					className={css.scrollToTop}
					size={ActionButtonSize.XLARGE}
					look={ActionButtonLook.SECONDARY}
					icon={<ArrowUpSvg />}
					onClick={() => genericLayoutApi.scrollToTop()}
				/>
			)}

			<div className={css.posts}>
				{feed.loaded ? (
					<>
						{feed.posts.length === 0 && <h2>No posts in this category.</h2>}
						{feed.posts.map(post => (
							<FeedPostItem key={post.id} isInFeed realtedAccounts={selectedAccounts} post={post} />
						))}

						{feed.moreAvailable && (
							<InView
								className={css.loader}
								rootMargin="100px"
								onChange={inView => inView && feed.loadMore()}
							>
								<SimpleLoader />
							</InView>
						)}
					</>
				) : feed.error ? (
					<ErrorMessage
						look={feed.error === ErrorCode.NO_POSTS_FOR_ADDRESS ? ErrorMessageLook.INFO : undefined}
					>
						{feed.error === ErrorCode.NO_POSTS_FOR_ADDRESS ? (
							<>
								<b>No posts for this account.</b>
								<div>
									Your crypto account doesn't have any tokens or transactions that we can use to build
									the Feed for you. You can connect another account anytime.
								</div>
								<ActionButton
									look={ActionButtonLook.PRIMARY}
									onClick={() => connectAccount({ place: 'feed_no-posts-for-account' })}
								>
									Connect another account
								</ActionButton>
							</>
						) : (
							'Sorry, an error occured during feed loading. Please, try again later.'
						)}
					</ErrorMessage>
				) : feed.loading ? (
					<div className={css.loader}>
						<SimpleLoader />
					</div>
				) : (
					canLoadFeed || (
						<ErrorMessage look={ErrorMessageLook.INFO}>
							<div>
								You need to connect a crypto wallet in order to use <b>Smart feed</b> 🔥
							</div>
							<ActionButton
								look={ActionButtonLook.PRIMARY}
								onClick={() => connectAccount({ place: 'feed_no-accounts' })}
							>
								Connect account
							</ActionButton>
						</ErrorMessage>
					)
				)}
			</div>
		</NarrowContent>
	);
});

export function FeedPage() {
	return (
		<GenericLayout>
			<FeedPageContent />
		</GenericLayout>
	);
}
