import './sendMailButton.module.scss';

import { EVM_NAMES, EVMNetwork } from '@ylide/ethereum';
import { Dropdown, Menu } from 'antd';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { ReactNode, useEffect } from 'react';
import { generatePath } from 'react-router-dom';

import { blockchainsMap, evmNameToNetwork } from '../../../constants';
import AlertModal from '../../../modals/AlertModal';
import domain from '../../../stores/Domain';
import { evmBalances } from '../../../stores/evmBalances';
import mailer from '../../../stores/Mailer';
import { useMailStore } from '../../../stores/MailList';
import { OutgoingMailData } from '../../../stores/outgoingMailData';
import { RoutePath } from '../../../stores/routePath';
import { useNav } from '../../../utils/navigate';
import { smallButtonIcons } from '../../smallButton/smallButton';

export interface SendMailButtonProps {
	mailData: OutgoingMailData;
}

export const SendMailButton = observer(({ mailData }: SendMailButtonProps) => {
	const navigate = useNav();
	const lastActiveFolderId = useMailStore(state => state.lastActiveFolderId);

	useEffect(() => {
		(async () => {
			if (mailData.from?.wallet.factory.blockchainGroup === 'evm') {
				const blockchainName = await mailData.from.wallet.controller.getCurrentBlockchain();
				mailData.network = evmNameToNetwork(blockchainName);

				await evmBalances.updateBalances(mailData.from.wallet, mailData.from.account.address);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mailData.from]);

	let text: ReactNode = 'Send';
	if (mailData.from?.wallet.factory.blockchainGroup === 'everscale') {
		const bData = blockchainsMap.everscale;
		text = (
			<>
				Send via {bData.logo(14)} {bData.title}
			</>
		);
	} else if (mailData.from?.wallet.factory.blockchainGroup === 'evm' && mailData.network !== undefined) {
		const bData = blockchainsMap[EVM_NAMES[mailData.network]];
		if (bData) {
			text = (
				<>
					Send via {bData.logo(16)} {bData.title}
				</>
			);
		} else {
			console.log('WTF: ', mailData.network, EVM_NAMES[mailData.network]);
		}
	}

	const sendMailHandler = async () => {
		try {
			if (mailData.to.items.some(r => !r.routing?.details)) {
				return alert("For some of your recipients we didn't find keys on the blockchain.");
			}

			mailer.sending = true;

			const acc = mailData.from!;
			const curr = await acc.wallet.getCurrentAccount();
			if (curr?.address !== acc.account.address) {
				await domain.handleSwitchRequest(acc.wallet.factory.wallet, curr, acc.account);
			}

			const msgId = await mailer.sendMail(
				acc,
				mailData.subject,
				JSON.stringify(mailData.editorData),
				mailData.to.items.map(r => r.routing?.address!),
				mailData.network,
			);

			await AlertModal.show('Message sent', 'Your message was successfully sent');
			console.log('id: ', msgId);

			navigate(generatePath(RoutePath.MAIL_FOLDER, { folderId: lastActiveFolderId }));
		} catch (e) {
			console.log('Error sending message', e);
		}
	};

	return (
		<div
			className={clsx('send-btn', {
				disabled:
					mailer.sending ||
					!mailData.from ||
					!mailData.to.items.length ||
					mailData.to.items.some(r => r.isLoading) ||
					!mailData.editorData?.blocks?.length,
				withDropdown: mailData.from?.wallet.factory.blockchainGroup === 'evm',
			})}
		>
			<div className="send-btn-text" onClick={sendMailHandler}>
				<i style={{ marginRight: 6 }} className={clsx('fa', smallButtonIcons.reply)}></i>
				{text && <span className="send-btn-title">{text}</span>}
			</div>
			{mailData.from?.wallet.factory.blockchainGroup === 'evm' ? (
				<Dropdown
					overlay={
						<Menu
							onClick={async info => {
								const evmNetworks = (Object.keys(EVM_NAMES) as unknown as EVMNetwork[]).map(
									(network: EVMNetwork) => ({
										name: EVM_NAMES[network],
										network: Number(network) as EVMNetwork,
									}),
								);
								const blockchainName = info.key;
								const newNetwork = evmNetworks.find(n => n.name === blockchainName)?.network;
								const currentBlockchainName =
									await mailData.from!.wallet.controller.getCurrentBlockchain();
								if (currentBlockchainName !== blockchainName) {
									await domain.switchEVMChain(newNetwork!);
									mailData.network = newNetwork;
								}
							}}
							items={domain.registeredBlockchains
								.filter(f => f.blockchainGroup === 'evm')
								.map(bc => {
									const bData = blockchainsMap[bc.blockchain];
									return {
										key: bc.blockchain,
										disabled:
											Number(
												evmBalances.balances[evmNameToNetwork(bc.blockchain)!].toFixed(3),
											) === 0,
										label: (
											<>
												{bData.title} [
												{Number(
													evmBalances.balances[evmNameToNetwork(bc.blockchain)!].toFixed(3),
												)}{' '}
												{bData.ethNetwork!.nativeCurrency.symbol}]
											</>
										),
										icon: <div style={{ marginRight: 7 }}>{bData.logo(16)}</div>,
									};
								})}
						/>
					}
				>
					<div className="send-btn-dropdown-icon">
						<i className="fa fa-caret-down" />
					</div>
				</Dropdown>
			) : null}
		</div>
	);
});
