import { UsergroupAddOutlined } from '@ant-design/icons';
import { Avatar, Tooltip } from 'antd';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';

import { Blockie } from '../../../controls/Blockie';
import { ReactComponent as ArrowDownSvg } from '../../../icons/arrowDown.svg';
import { YlideLargeLogo } from '../../../icons/YlideLargeLogo';
import AlertModal from '../../../modals/AlertModal';
import { browserStorage } from '../../../stores/browserStorage';
import domain from '../../../stores/Domain';
import { FolderId } from '../../../stores/MailList';
import { RoutePath } from '../../../stores/routePath';
import { useNav } from '../../../utils/navigate';
import { SidebarBurger } from '../sidebar/sidebarMenu';
import { AccountsPopup } from './accountsPopup/accountsPopup';
import css from './header.module.scss';

const Header = observer(() => {
	const nav = useNav();

	const accountsPopupButtonRef = useRef(null);
	const [isAccountsPopupOpen, setAccountsPopupOpen] = useState(false);

	return (
		<div className={css.root}>
			<SidebarBurger className={css.burger} />

			<div className={css.logo}>
				<a
					href={generatePath(RoutePath.MAIL_FOLDER, { folderId: FolderId.Inbox })}
					onClick={e => {
						e.preventDefault();
						nav(generatePath(RoutePath.MAIL_FOLDER, { folderId: FolderId.Inbox }));
					}}
				>
					<YlideLargeLogo className={css.logoImage} />
				</a>
			</div>
			<div className={css.main}>
				<div className={css.block}>
					<Tooltip title="Manage contacts and folders">
						<UsergroupAddOutlined
							onClick={e => {
								e.preventDefault();
								nav(generatePath(RoutePath.MAIL_CONTACTS));
							}}
							style={{ fontSize: 20 }}
						/>
					</Tooltip>
				</div>
				<div className={css.block}>
					<button
						ref={accountsPopupButtonRef}
						className={css.users}
						onClick={() => setAccountsPopupOpen(!isAccountsPopupOpen)}
					>
						<div className={css.usersAvatars}>
							{domain.accounts.accounts.map(acc => (
								<Avatar key={acc.account.address} icon={<Blockie address={acc.account.address} />} />
							))}
						</div>
						<div className={css.usersText}>
							{domain.accounts.accounts.length} account
							{domain.accounts.accounts.length > 1 ? 's' : ''}
							<span>&nbsp;connected</span>
						</div>
						<ArrowDownSvg className={css.usersIcon} />
					</button>

					{isAccountsPopupOpen && (
						<AccountsPopup anchorRef={accountsPopupButtonRef} onClose={() => setAccountsPopupOpen(false)} />
					)}
				</div>
			</div>
		</div>
	);
});

export default Header;
