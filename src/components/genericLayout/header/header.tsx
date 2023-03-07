import { Avatar, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';

import { Blockie } from '../../../controls/Blockie';
import { REACT_APP__OTC_MODE } from '../../../env';
import { ReactComponent as ArrowDownSvg } from '../../../icons/ic20/arrowDown.svg';
import { ReactComponent as ContactsSvg } from '../../../icons/ic28/contacts.svg';
import { YlideLargeLogo } from '../../../icons/YlideLargeLogo';
import domain from '../../../stores/Domain';
import { RoutePath } from '../../../stores/routePath';
import { useNav } from '../../../utils/url';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../ActionButton/ActionButton';
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
					href={generatePath(RoutePath.ROOT)}
					onClick={e => {
						e.preventDefault();
						nav(generatePath(RoutePath.ROOT));
					}}
				>
					<YlideLargeLogo className={css.logoImage} />
				</a>
			</div>
			<div className={css.main}>
				{REACT_APP__OTC_MODE || (
					<div className={css.block}>
						<Tooltip title="Manage contacts and folders">
							<ActionButton
								size={ActionButtonSize.MEDIUM}
								look={ActionButtonLook.LITE}
								icon={<ContactsSvg />}
								onClick={e => {
									e.preventDefault();
									nav(generatePath(RoutePath.MAIL_CONTACTS));
								}}
							/>
						</Tooltip>
					</div>
				)}

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
