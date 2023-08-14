import clsx from 'clsx';
import { observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { AnchorHTMLAttributes, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { generatePath, useLocation } from 'react-router-dom';

import { AppMode, REACT_APP__APP_MODE } from '../../../env';
import { ReactComponent as ArchiveSvg } from '../../../icons/archive.svg';
import { ReactComponent as ContactSvg } from '../../../icons/ic20/contact.svg';
import { ReactComponent as SettingsSvg } from '../../../icons/ic20/settings.svg';
import { ReactComponent as SidebarMenuSvg } from '../../../icons/ic28/sidebarMenu.svg';
import { ReactComponent as SidebarMenuCloseSvg } from '../../../icons/ic28/sidebarMenu_close.svg';
import { ReactComponent as InboxSvg } from '../../../icons/inbox.svg';
import { ReactComponent as SentSvg } from '../../../icons/sent.svg';
import { ReactComponent as DiscordSvg } from '../../../icons/social/discord.svg';
import { ReactComponent as LinkedInSvg } from '../../../icons/social/linkedIn.svg';
import { ReactComponent as MediumSvg } from '../../../icons/social/medium.svg';
import { ReactComponent as TelegramSvg } from '../../../icons/social/telegram.svg';
import { ReactComponent as TwitterSvg } from '../../../icons/social/twitter.svg';
import { sideFeedIcon } from '../../../icons/static/sideFeedIcon';
import { FeedSettingsPopup } from '../../../pages/feed/_common/feedSettingsPopup/feedSettingsPopup';
import { analytics } from '../../../stores/Analytics';
import {
	BlockchainProject,
	BlockchainProjectId,
	getBlockchainProjectById,
} from '../../../stores/blockchainProjects/blockchainProjects';
import { browserStorage } from '../../../stores/browserStorage';
import domain from '../../../stores/Domain';
import { feedSettings } from '../../../stores/FeedSettings';
import { FolderId, getFolderName, MailList } from '../../../stores/MailList';
import { DomainAccount } from '../../../stores/models/DomainAccount';
import { RoutePath } from '../../../stores/routePath';
import { useOpenMailCompose } from '../../../utils/mail';
import { openCreateCommunityForm } from '../../../utils/misc';
import { useIsMatchesPath, useNav } from '../../../utils/url';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../ActionButton/ActionButton';
import { AdaptiveText } from '../../adaptiveText/adaptiveText';
import { MiniProjectCard } from '../../blockchainProjectCards/miniProjectCard/miniProjectCard';
import { PropsWithClassName } from '../../props';
import { toast } from '../../toast/toast';
import css from './sidebarMenu.module.scss';

export const isSidebarOpen = observable.box(false);

interface SidebarBurgerProps extends PropsWithClassName, PropsWithChildren<{}> {}

export const SidebarBurger = observer(({ className, children }: SidebarBurgerProps) => (
	<div className={clsx(css.burger, className)}>
		<ActionButton
			size={ActionButtonSize.LARGE}
			icon={isSidebarOpen.get() ? <SidebarMenuCloseSvg /> : <SidebarMenuSvg />}
			onClick={() => isSidebarOpen.set(!isSidebarOpen.get())}
		>
			{children}
		</ActionButton>
	</div>
));

//

interface SidebarSectionProps extends PropsWithChildren<{}> {
	title?: ReactNode;
	button?: {
		look?: ActionButtonLook;
		text: ReactNode;
		onClick?: () => void;
	};
}

function SidebarSection({ children, title, button }: SidebarSectionProps) {
	return (
		<div className={css.section}>
			{title != null && (
				<div className={css.sectionTitle}>
					<div className={css.sectionTitleText}>{title}</div>

					{button && (
						<ActionButton
							size={ActionButtonSize.XSMALL}
							look={button.look || ActionButtonLook.SUBTILE}
							className={css.sectionButton}
							onClick={() => {
								isSidebarOpen.set(false);
								button?.onClick?.();
							}}
						>
							{button.text}
						</ActionButton>
					)}
				</div>
			)}

			<div className={css.sectionContent}>{children}</div>
		</div>
	);
}

//

interface SidebarButtonProps {
	href: string;
	icon?: ReactNode;
	name: ReactNode;
	rightButton?: {
		icon: ReactNode;
		title?: string;
		onClick: () => void;
	};
}

export const SidebarButton = observer(({ href, icon, name, rightButton }: SidebarButtonProps) => {
	const location = useLocation();
	const navigate = useNav();

	const isActive = location.pathname === href;

	const isExternal = !href.startsWith('/');
	const externalProps: AnchorHTMLAttributes<HTMLAnchorElement> = isExternal
		? {
				target: '_blank',
				rel: 'noreferrer',
		  }
		: {};

	return (
		<a
			{...externalProps}
			className={clsx(css.sidebarButton, isActive && css.sidebarButton_active)}
			href={href}
			onClick={e => {
				isSidebarOpen.set(false);

				if (!isExternal) {
					e.preventDefault();
					navigate(href);
				}
			}}
		>
			{icon && <div className={css.sidebarButtonIcon}>{icon}</div>}
			<div className={css.sidebarButtonTitle}>{name}</div>

			{rightButton && (
				<ActionButton
					className={css.sidebarButtonRight}
					look={ActionButtonLook.LITE}
					icon={rightButton.icon}
					title={rightButton.title}
					onClick={e => {
						e.stopPropagation();
						isSidebarOpen.set(false);

						rightButton?.onClick();
					}}
				/>
			)}
		</a>
	);
});

//

interface SidebarProjectProps {
	project: BlockchainProject;
}

export function SidebarProject({ project }: SidebarProjectProps) {
	const href = generatePath(RoutePath.PROJECT_ID, { projectId: project.id });
	const isActive = useIsMatchesPath(href);

	return <MiniProjectCard className={clsx(isActive && css.sidebarProject_active)} project={project} />;
}

//

enum SidebarBlockLook {
	REGULAR = 'REGULAR',
	PRETTY = 'PRETTY',
}

interface SidebarBlockProps extends PropsWithChildren {
	look?: SidebarBlockLook;
}

export function SidebarBlock({ children, look }: SidebarBlockProps) {
	const lookClass = {
		[SidebarBlockLook.REGULAR]: css.block_regularLook,
		[SidebarBlockLook.PRETTY]: css.block_prettyLook,
	}[look || SidebarBlockLook.REGULAR];

	return <div className={clsx(css.block, lookClass)}>{children}</div>;
}

//

export const SidebarMailSection = observer(() => {
	const openMailCompose = useOpenMailCompose();

	const accounts = domain.accounts.activeAccounts;

	const [hasNewMessages, setHasNewMessages] = useState(false);

	useEffect(() => {
		const mailList = new MailList();

		mailList.init({
			mailbox: {
				accounts,
				folderId: FolderId.Inbox,
			},
		});

		const key = accounts
			.map(a => a.account.address)
			.sort()
			.join(',');

		const dispose = reaction(
			() => ({
				newMessagesCount: mailList.newMessagesCount,
				messagesData: mailList.messagesData,
				lastMailboxCheckDate: browserStorage.lastMailboxCheckDate,
			}),
			({ newMessagesCount, messagesData, lastMailboxCheckDate }) => {
				if (newMessagesCount) {
					mailList.drainNewMessages();
				}

				const lastMessage = messagesData[0];
				const lastCheckedDate = lastMailboxCheckDate[key];

				setHasNewMessages(
					!!lastMessage && (!lastCheckedDate || lastMessage.raw.msg.createdAt > lastCheckedDate),
				);
			},
		);

		return () => {
			dispose();
			mailList.destroy();
		};
	}, [accounts]);

	return (
		<SidebarBlock look={SidebarBlockLook.PRETTY}>
			<SidebarSection
				title="Mailbox"
				button={{
					look: ActionButtonLook.PRIMARY,
					text: 'Compose',
					onClick: () => {
						isSidebarOpen.set(false);
						openMailCompose({ place: 'sidebar' });
					},
				}}
			>
				<SidebarButton
					href={generatePath(RoutePath.MAIL_FOLDER, { folderId: FolderId.Inbox })}
					icon={<InboxSvg />}
					name={
						<div className={css.inboxButton}>
							{getFolderName(FolderId.Inbox)}
							{hasNewMessages && <div className={css.inboxNotification} title="You have new messages" />}
						</div>
					}
				/>

				<SidebarButton
					href={generatePath(RoutePath.MAIL_FOLDER, { folderId: FolderId.Sent })}
					icon={<SentSvg />}
					name={getFolderName(FolderId.Sent)}
				/>

				<SidebarButton
					href={generatePath(RoutePath.MAIL_FOLDER, { folderId: FolderId.Archive })}
					icon={<ArchiveSvg />}
					name={getFolderName(FolderId.Archive)}
				/>
			</SidebarSection>
		</SidebarBlock>
	);
});

export const SidebarMenu = observer(() => {
	const navigate = useNav();

	const [feedSettingsAccount, setFeedSettingsAccount] = useState<DomainAccount>();
	const tags = feedSettings.tags;

	function renderOtcSection() {
		if (REACT_APP__APP_MODE !== AppMode.OTC) return;

		return (
			<SidebarSection title="OTC Trading">
				<SidebarButton href={generatePath(RoutePath.OTC_ASSETS)} icon={<InboxSvg />} name="Asset Explorer" />

				<SidebarButton href={generatePath(RoutePath.OTC_CHATS)} icon={<SentSvg />} name="Chats" />
			</SidebarSection>
		);
	}

	function renderSmartFeedSection() {
		if (REACT_APP__APP_MODE !== AppMode.MAIN_VIEW) return;

		return (
			<SidebarSection title="Smart Feed">
				<SidebarButton href={generatePath(RoutePath.FEED_SMART)} icon={sideFeedIcon(14)} name="All Accounts" />

				{domain.accounts.activeAccounts.map((account, i) => (
					<SidebarButton
						key={i}
						href={generatePath(RoutePath.FEED_SMART_ADDRESS, { address: account.account.address })}
						icon={<ContactSvg />}
						name={<AdaptiveText text={account.name || account.account.address} />}
						rightButton={
							REACT_APP__APP_MODE === AppMode.MAIN_VIEW
								? {
										icon: <SettingsSvg />,
										title: 'Feed Settings',
										onClick: () => {
											if (!account.mainViewKey) {
												return toast('Please complete the onboarding first ❤');
											}

											setFeedSettingsAccount(account);
										},
								  }
								: undefined
						}
					/>
				))}

				{feedSettingsAccount && (
					<FeedSettingsPopup
						account={feedSettingsAccount}
						onClose={() => setFeedSettingsAccount(undefined)}
					/>
				)}
			</SidebarSection>
		);
	}

	function renderBlockchainProjectsSection() {
		if (REACT_APP__APP_MODE !== AppMode.HUB) return;

		function renderProjects(projects: BlockchainProjectId[]) {
			return projects.map(id => <SidebarProject key={id} project={getBlockchainProjectById(id)} />);
		}

		return (
			<SidebarBlock>
				<SidebarSection
					title="Trending"
					button={{ text: 'Explore', onClick: () => navigate(generatePath(RoutePath.ROOT)) }}
				>
					{renderProjects([
						BlockchainProjectId.TVM,
						BlockchainProjectId.OASIS_GALLERY,
						BlockchainProjectId.GRAVIX,
						BlockchainProjectId.WEB3_WORLD,
						BlockchainProjectId.YLIDE,
					])}
				</SidebarSection>

				<SidebarSection
					title="Newly Added"
					button={{
						text: 'Create',
						onClick: () => openCreateCommunityForm(),
					}}
				>
					{renderProjects([
						BlockchainProjectId.ONE_CLICK_CRYPTO,
						BlockchainProjectId.GNOSIS_BUILDERS,
						BlockchainProjectId.BET_FURY,
					])}
				</SidebarSection>
			</SidebarBlock>
		);
	}

	function renderFeedDiscoverySection() {
		if (REACT_APP__APP_MODE !== AppMode.MAIN_VIEW) return;

		return (
			<SidebarSection title={REACT_APP__APP_MODE === AppMode.MAIN_VIEW ? 'Discovery' : 'Feed'}>
				{/* TODO: KONST */}
				{tags === 'error' ? (
					<></>
				) : tags === 'loading' ? (
					<div>Loading</div>
				) : (
					tags.map(t => (
						<SidebarButton
							key={t.id}
							href={generatePath(RoutePath.FEED_CATEGORY_ID, { tag: t.id.toString() })}
							name={t.name}
						/>
					))
				)}
			</SidebarSection>
		);
	}

	function renderMailSection() {
		if (REACT_APP__APP_MODE !== AppMode.HUB) return;

		return <SidebarMailSection />;
	}

	return (
		<div className={css.root}>
			{renderOtcSection()}
			{renderSmartFeedSection()}
			{renderBlockchainProjectsSection()}
			{renderFeedDiscoverySection()}
			{renderMailSection()}

			<div className={css.divider} />

			<div className={css.socials}>
				<a
					href="https://t.me/ylide_chat"
					target="_blank noreferrer"
					title="Telegram"
					onClick={() => analytics.openSocial('telegram')}
				>
					<TelegramSvg />
				</a>

				<a
					href="https://discord.gg/ylide"
					target="_blank noreferrer"
					title="Discord"
					onClick={() => analytics.openSocial('discord')}
				>
					<DiscordSvg />
				</a>

				<a
					href="https://twitter.com/ylide_"
					target="_blank noreferrer"
					title="Twitter"
					onClick={() => analytics.openSocial('twitter')}
				>
					<TwitterSvg />
				</a>

				<a
					href="https://www.linkedin.com/company/ylide/"
					target="_blank noreferrer"
					title="LinkedIn"
					onClick={() => analytics.openSocial('linkedin')}
				>
					<LinkedInSvg />
				</a>

				<a
					href="https://medium.com/@ylide"
					target="_blank noreferrer"
					title="Medium"
					onClick={() => analytics.openSocial('medium')}
				>
					<MediumSvg />
				</a>
			</div>
		</div>
	);
});
