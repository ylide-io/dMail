import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { FeedCategory, FeedServerApi } from '../../../api/feedServerApi';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../../components/ActionButton/ActionButton';
import { ErrorMessage } from '../../../components/errorMessage/errorMessage';
import { NarrowContent } from '../../../components/genericLayout/content/narrowContent/narrowContent';
import { GenericLayout, useGenericLayoutApi } from '../../../components/genericLayout/genericLayout';
import { YlideLoader } from '../../../components/ylideLoader/ylideLoader';
import { ReactComponent as ArrowUpSvg } from '../../../icons/ic20/arrowUp.svg';
import { ReactComponent as CrossSvg } from '../../../icons/ic20/cross.svg';
import { useDomainAccounts } from '../../../stores/Domain';
import { FeedStore, getFeedCategoryName } from '../../../stores/Feed';
import { useNav } from '../../../utils/url';
import { FeedPostItem } from '../components/feedPostItem/feedPostItem';
import css from './feedPage.module.scss';
import ErrorCode = FeedServerApi.ErrorCode;

function isInViewport(element: HTMLDivElement) {
	const rect = element.getBoundingClientRect();
	return rect.top >= -100 && rect.top <= (window.innerHeight || document.documentElement.clientHeight);
}

const FeedPageContent = observer(() => {
	const navigate = useNav();
	const genericLayoutApi = useGenericLayoutApi();

	const lastPostView = useRef<HTMLDivElement>(null);
	const feedBodyRef = useRef<HTMLDivElement>(null);
	const { category, source, address } = useParams<{ category: FeedCategory; source: string; address: string }>();

	const accounts = useDomainAccounts();

	// TODO Reload when feed settings changes
	// TODO New posts button only when scrolled down

	const feed = useMemo(() => {
		const feed = new FeedStore({
			category,
			sourceId: source,
			addresses: address
				? [address]
				: !category && !source && !address
				? accounts.map(a => a.account.address)
				: undefined,
		});

		genericLayoutApi.scrollToTop();
		feed.load();

		return feed;
	}, [accounts, address, category, genericLayoutApi, source]);

	useEffect(() => {
		const timer = setInterval(async () => {
			if (lastPostView.current && isInViewport(lastPostView.current) && feed.moreAvailable) {
				await feed.loadMore();
			}
		}, 300);

		return () => clearInterval(timer);
	}, [feed]);

	const showNewPosts = async () => {
		genericLayoutApi.scrollToTop();
		await feed.loadNew();
	};

	return (
		<NarrowContent
			title={getFeedCategoryName(feed.selectedCategory)}
			titleSubItem={
				!!source && (
					<ActionButton
						look={ActionButtonLook.PRIMARY}
						icon={<CrossSvg />}
						onClick={() => navigate({ search: {} })}
					>
						Clear filter
					</ActionButton>
				)
			}
			titleRight={
				!!feed.newPosts && (
					<ActionButton look={ActionButtonLook.SECONDARY} onClick={showNewPosts}>
						Show {feed.newPosts} new posts
					</ActionButton>
				)
			}
		>
			{!!feed.posts.length && (
				<ActionButton
					className={css.scrollToTop}
					size={ActionButtonSize.XLARGE}
					look={ActionButtonLook.SECONDARY}
					icon={<ArrowUpSvg />}
					onClick={() => genericLayoutApi.scrollToTop()}
				/>
			)}

			<div className={css.feedBody} ref={feedBodyRef}>
				{!!feed.newPosts && (
					<ActionButton
						look={ActionButtonLook.SECONDARY}
						className={css.newPostsButton}
						onClick={showNewPosts}
					>
						Show {feed.newPosts} new posts
					</ActionButton>
				)}

				{feed.loaded ? (
					<>
						{feed.posts.map(post => (
							<FeedPostItem isInFeed post={post} key={post.id} />
						))}

						{feed.moreAvailable && (
							<div className={css.loader} ref={lastPostView}>
								{feed.loading && <YlideLoader reason="Loading more posts ..." />}
							</div>
						)}
					</>
				) : feed.error ? (
					<ErrorMessage>
						{feed.error === ErrorCode.NO_POSTS_FOR_ADDRESS
							? 'No posts for your account.'
							: 'Sorry, an error occured during feed loading. Please, try again later.'}
					</ErrorMessage>
				) : (
					<div className={css.loader}>
						<YlideLoader reason="Your feed is loading ..." />
					</div>
				)}
			</div>
		</NarrowContent>
	);
});

export const FeedPage = () => (
	<GenericLayout>
		<FeedPageContent />
	</GenericLayout>
);
