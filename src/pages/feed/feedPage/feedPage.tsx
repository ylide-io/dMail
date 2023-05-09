import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { FeedCategory } from '../../../api/feedServerApi';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../../components/ActionButton/ActionButton';
import { ErrorMessage } from '../../../components/errorMessage/errorMessage';
import { NarrowContent } from '../../../components/genericLayout/content/narrowContent/narrowContent';
import { GenericLayout, useGenericLayoutApi } from '../../../components/genericLayout/genericLayout';
import { YlideLoader } from '../../../components/ylideLoader/ylideLoader';
import { ReactComponent as ArrowUpSvg } from '../../../icons/ic20/arrowUp.svg';
import { ReactComponent as CrossSvg } from '../../../icons/ic20/cross.svg';
import { browserStorage } from '../../../stores/browserStorage';
import feed, { getFeedCategoryName } from '../../../stores/Feed';
import { useNav } from '../../../utils/url';
import { FeedPostItem } from '../components/feedPostItem/feedPostItem';
import css from './feedPage.module.scss';

function isInViewport(element: HTMLDivElement) {
	const rect = element.getBoundingClientRect();
	return rect.top >= -100 && rect.top <= (window.innerHeight || document.documentElement.clientHeight);
}

const FeedPageContent = observer(() => {
	const navigate = useNav();
	const genericLayoutApi = useGenericLayoutApi();

	const lastPostView = useRef<HTMLDivElement>(null);
	const feedBodyRef = useRef<HTMLDivElement>(null);
	const [newPostsVisible, setNewPostsVisible] = useState(false);
	const { category } = useParams<{ category: FeedCategory }>();
	const [searchParams] = useSearchParams();
	const sourceId = searchParams.get('sourceId') || undefined;

	const sourceListId = browserStorage.feedSourceSettings?.listId;
	const [lastSourceListId, setLastSourceListId] = useState(sourceListId);

	// Re-load when category changes
	useEffect(() => {
		genericLayoutApi.scrollToTop();
		feed.loadCategory(category!, sourceId);
	}, [category, sourceId]);

	// Re-load when source-list changes
	useEffect(() => {
		if (lastSourceListId !== sourceListId) {
			setLastSourceListId(sourceListId);

			if (category === FeedCategory.MAIN) {
				genericLayoutApi.scrollToTop();
				feed.loadCategory(category, sourceId);
			}
		}
	}, [category, lastSourceListId, sourceId, sourceListId]);

	useEffect(() => {
		const timer = setInterval(async () => {
			if (lastPostView.current && isInViewport(lastPostView.current) && !feed.loading && feed.moreAvailable) {
				await feed.loadMore(10);
			}

			if (feedBodyRef.current && feedBodyRef.current.getBoundingClientRect().top < 0) {
				setNewPostsVisible(true);
			} else {
				setNewPostsVisible(false);
			}
		}, 300);

		return () => clearInterval(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [feed.loading, feed.moreAvailable]);

	const showNewPosts = async () => {
		genericLayoutApi.scrollToTop();
		await feed.loadNew();
	};

	const title = getFeedCategoryName(feed.selectedCategory);

	return (
		<NarrowContent
			title={title}
			titleSubItem={
				!!sourceId && (
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
			<ActionButton
				className={css.scrollToTop}
				size={ActionButtonSize.XLARGE}
				look={ActionButtonLook.SECONDARY}
				icon={<ArrowUpSvg />}
				onClick={() => genericLayoutApi.scrollToTop()}
			/>

			<div className={css.feedBody} ref={feedBodyRef}>
				{newPostsVisible && !!feed.newPosts && (
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
				) : feed.errorLoading ? (
					<ErrorMessage>Sorry, an error occured during feed loading. Please, try again later.</ErrorMessage>
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
