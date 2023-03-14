import { EthereumWalletController, EVMNetwork } from '@ylide/ethereum';
import { asyncDelay, ExternalYlidePublicKey, IGenericAccount } from '@ylide/sdk';
import SmartBuffer from '@ylide/smart-buffer';
import { useEffect, useMemo, useState } from 'react';
import { generatePath } from 'react-router-dom';

import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../components/ActionButton/ActionButton';
import { useForgotPasswordModal } from '../../components/forgotPasswordModal/forgotPasswordModal';
import { Modal } from '../../components/modal/modal';
import { SelectNetworkModal } from '../../components/selectNetworkModal/selectNetworkModal';
import { createSingletonStaticComponentHook } from '../../components/staticComponentManager/staticComponentManager';
import { TextField, TextFieldLook } from '../../components/textField/textField';
import { useToastManager } from '../../components/toast/toast';
import { YlideLoader } from '../../components/ylideLoader/ylideLoader';
import { WalletTag } from '../../controls/WalletTag';
import { REACT_APP__OTC_MODE } from '../../env';
import { analytics } from '../../stores/Analytics';
import { browserStorage } from '../../stores/browserStorage';
import domain from '../../stores/Domain';
import { evmBalances } from '../../stores/evmBalances';
import { DomainAccount } from '../../stores/models/DomainAccount';
import { Wallet } from '../../stores/models/Wallet';
import { RoutePath } from '../../stores/routePath';
import { assertUnreachable, invariant } from '../../utils/assert';
import { blockchainMeta } from '../../utils/blockchain';
import { isBytesEqual } from '../../utils/isBytesEqual';
import { getEvmWalletNetwork } from '../../utils/wallet';

export const useNewPasswordModal = createSingletonStaticComponentHook<NewPasswordModalProps, boolean>(
	(props, resolve) => (
		<NewPasswordModal
			{...props}
			onClose={success => {
				resolve(success);
				props.onClose?.(success);
			}}
		/>
	),
);

//

enum Step {
	ENTER_PASSWORD,
	GENERATE_KEY,
	SELECT_NETWORK,
	PUBLISH_KEY,
	PUBLISHING_KEY,
}

interface NewPasswordModalProps {
	faucetType: null | 'polygon' | 'gnosis' | 'fantom';
	bonus: boolean;
	wallet: Wallet;
	account: IGenericAccount;
	remoteKeys: Record<string, ExternalYlidePublicKey | null>;
	onClose?: (success: boolean) => void;
}

export function NewPasswordModal({ faucetType, bonus, wallet, account, remoteKeys, onClose }: NewPasswordModalProps) {
	const { toast } = useToastManager();

	const [step, setStep] = useState(Step.ENTER_PASSWORD);

	const [password, setPassword] = useState('');
	const [passwordRepeat, setPasswordRepeat] = useState('');

	const forgotPasswordModal = useForgotPasswordModal();

	const [network, setNetwork] = useState<EVMNetwork>();
	useEffect(() => {
		if (wallet.factory.blockchainGroup === 'evm') {
			getEvmWalletNetwork(wallet).then(setNetwork);
			evmBalances.updateBalances(wallet, account.address).then();
		}
	}, [account.address, wallet]);

	const freshestKey = useMemo(
		() =>
			Object.keys(remoteKeys)
				.filter(t => !!remoteKeys[t])
				.map(t => ({
					key: remoteKeys[t]!,
					blockchain: t,
				}))
				.sort((a, b) => b.key.timestamp - a.key.timestamp)[0],
		[remoteKeys],
	);

	const [domainAccount, setDomainAccount] = useState<DomainAccount>();

	const [pleaseWait, setPleaseWait] = useState(false);

	async function requestFaucetSignature(account: DomainAccount) {
		const msg = new SmartBuffer(account.key.keypair.publicKey).toHexString();
		try {
			const signature = await (wallet.controller as EthereumWalletController).signString(account.account, msg);
			console.log('signature: ', signature);
			return signature;
		} catch (err) {
			console.error('aasdasdas: ', err);
			throw err;
		}
	}

	async function publishThroughFaucet(
		account: DomainAccount,
		faucetType: 'polygon' | 'gnosis' | 'fantom',
		bonus: boolean,
		doWait: boolean,
	) {
		browserStorage.canSkipRegistration = true;
		console.log('public key: ', '0x' + new SmartBuffer(account.key.keypair.publicKey).toHexString());
		setStep(Step.GENERATE_KEY);
		const signature = await requestFaucetSignature(account);
		setPleaseWait(true);
		domain.isTxPublishing = true;
		analytics.walletRegistered(wallet.factory.wallet, account.account.address, domain.accounts.accounts.length);
		domain.txChain = faucetType;
		domain.txPlateVisible = true;
		domain.txWithBonus = bonus;
		const promise = fetch(`https://faucet.ylide.io/${faucetType}`, {
			method: 'POST',
			body: JSON.stringify({
				address: account.account.address.toLowerCase(),
				referrer: '0x0000000000000000000000000000000000000000',
				payBonus: bonus ? '1' : '0',
				publicKey: '0x' + new SmartBuffer(account.key.keypair.publicKey).toHexString(),
				keyVersion: 2,
				_r: signature.r,
				_s: signature.s,
				_v: signature.v,
			}),
		})
			.then(response => response.json())
			.then(async result => {
				if (result && result.data && result.data.txHash) {
					if (doWait) {
						await asyncDelay(20000);
					} else {
						await asyncDelay(7000);
					}
					await account.init();
					domain.publishingTxHash = result.data.txHash;
					domain.isTxPublishing = false;
				} else {
					domain.isTxPublishing = false;
					if (result.error === 'Already exists') {
						alert(
							`Your address has been already registered or the previous transaction is in progress. Please try connecting another address or wait for transaction to finalize (1-2 minutes).`,
						);
						document.location.href = generatePath(RoutePath.WALLETS);
						return;
					}
					alert('Something went wrong with key publishing :(\n\n' + JSON.stringify(result, null, '\t'));
					document.location.href = generatePath(RoutePath.WALLETS);
					return;
				}
			})
			.catch(err => {
				console.log('fetch', err);
				domain.isTxPublishing = false;
				domain.txPlateVisible = false;
			});

		if (doWait) {
			await promise;
		}

		onClose?.(true);
	}

	async function publishLocalKey(account: DomainAccount) {
		setStep(Step.PUBLISH_KEY);
		try {
			await account.attachRemoteKey(network);
			await asyncDelay(7000);
			await account.init();
			analytics.walletRegistered(wallet.factory.wallet, account.account.address, domain.accounts.accounts.length);
			onClose?.(true);
		} catch (err) {
			if (wallet.factory.blockchainGroup === 'evm') {
				setStep(Step.SELECT_NETWORK);
			} else {
				setStep(Step.ENTER_PASSWORD);
			}
			toast('Transaction was not published. Please, try again');
		}
	}

	async function createLocalKey(password: string, forceNew?: boolean) {
		setStep(Step.GENERATE_KEY);

		let tempLocalKey;
		try {
			if (!forceNew && freshestKey && freshestKey.key.keyVersion === 1) {
				tempLocalKey = await wallet.constructLocalKeyV2(account, password); //wallet.constructLocalKeyV1(account, password);
			} else {
				tempLocalKey = await wallet.constructLocalKeyV2(account, password);
			}
		} catch (err) {
			console.log('createLocalKey ', err);
			setStep(Step.ENTER_PASSWORD);
			return;
		}

		if (!freshestKey) {
			const domainAccount = await wallet.instantiateNewAccount(account, tempLocalKey);
			setDomainAccount(domainAccount);
			if (faucetType && wallet.factory.blockchainGroup === 'evm') {
				await publishThroughFaucet(domainAccount, faucetType, bonus, REACT_APP__OTC_MODE);
			} else {
				if (wallet.factory.blockchainGroup === 'evm') {
					setStep(Step.SELECT_NETWORK);
				} else {
					return await publishLocalKey(domainAccount);
				}
			}
		} else if (isBytesEqual(freshestKey.key.publicKey.bytes, tempLocalKey.publicKey)) {
			await wallet.instantiateNewAccount(account, tempLocalKey);
			analytics.walletConnected(wallet.factory.wallet, account.address, domain.accounts.accounts.length);
			// if (freshestKey.key.keyVersion === 1) {
			// 	setStep(Step.OLD_KEY);
			// } else {
			onClose?.(true);
			// }
		} else if (forceNew) {
			const domainAccount = await wallet.instantiateNewAccount(account, tempLocalKey);
			setDomainAccount(domainAccount);
			return await publishLocalKey(domainAccount);
		} else {
			toast('Ylide password was wrong, please, try again');
			setStep(Step.ENTER_PASSWORD);
			return;
		}
	}

	async function networkSelect(network: EVMNetwork) {
		setNetwork(network);
		setStep(Step.PUBLISH_KEY);
		try {
			invariant(domainAccount);
			await publishLocalKey(domainAccount);
		} catch (err) {
			setStep(Step.SELECT_NETWORK);
		}
	}

	if (step === Step.SELECT_NETWORK) {
		return (
			<SelectNetworkModal
				wallet={wallet}
				account={account}
				onSelect={network => networkSelect(network)}
				onCancel={() => onClose?.(false)}
			/>
		);
	}

	return (
		<Modal className="account-modal wallet-modal" onClose={() => onClose?.(false)}>
			<div
				style={{
					padding: 24,
					paddingTop: 12,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<WalletTag wallet={wallet.factory.wallet} address={account.address} />
			</div>

			{step === Step.ENTER_PASSWORD ? (
				<>
					<h3 className="wm-title">{freshestKey ? `Enter password` : `Create password`}</h3>

					<h4 className="wm-subtitle">
						{freshestKey ? (
							<>
								We found your key in the {blockchainMeta[freshestKey.blockchain].logo(12)}{' '}
								<b>{blockchainMeta[freshestKey.blockchain].title}</b> blockchain. Please, enter your
								Ylide Password to access it.
							</>
						) : (
							`This password will be used to encrypt and decrypt your mails.`
						)}
					</h4>

					{freshestKey ? (
						<div className="wm-body centered" style={{ padding: '0 20px' }}>
							<TextField
								look={TextFieldLook.PROMO}
								autoFocus
								value={password}
								onValueChange={setPassword}
								type="password"
								placeholder="Enter your Ylide password"
							/>

							<div
								style={{
									marginTop: 8,
									textAlign: 'right',
								}}
							>
								<button
									onClick={() =>
										forgotPasswordModal({
											onNewPassword: password => {
												createLocalKey(password, true).then();
											},
										})
									}
								>
									Forgot Password?
								</button>
							</div>
						</div>
					) : (
						<div className="wm-body">
							<form
								name="sign-up"
								style={{
									display: 'grid',
									gridGap: 12,
									padding: '20px 16px 8px',
								}}
								action="/"
								method="POST"
								noValidate
							>
								<TextField
									look={TextFieldLook.PROMO}
									type="password"
									autoComplete="new-password"
									placeholder="Enter Ylide password"
									value={password}
									onValueChange={setPassword}
								/>
								<TextField
									look={TextFieldLook.PROMO}
									type="password"
									autoComplete="new-password"
									placeholder="Repeat your password"
									value={passwordRepeat}
									onValueChange={setPasswordRepeat}
								/>
							</form>
							<div className="ylide-callout">
								<div>
									Ylide <b>doesn't save</b> your password anywhere.
								</div>
								<br />
								<div>
									Please, save it securely, because if you lose it, you will not be able to access
									your mail.
								</div>
							</div>
						</div>
					)}

					<div className="wm-footer">
						<ActionButton size={ActionButtonSize.LARGE} onClick={() => onClose?.(false)}>
							Back
						</ActionButton>
						<ActionButton
							size={ActionButtonSize.LARGE}
							look={ActionButtonLook.PRIMARY}
							onClick={() => createLocalKey(password)}
						>
							Continue
						</ActionButton>
					</div>
				</>
			) : step === Step.GENERATE_KEY ? (
				<>
					{pleaseWait ? (
						<>
							<div className="wm-body centered">
								<h3 className="wm-title">Please, wait</h3>
								<h4 className="wm-subtitle">Your transaction is being confirmed</h4>
							</div>
						</>
					) : (
						<>
							<div className="wm-body centered">
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'flex-start',
										justifyContent: 'flex-end',
										paddingRight: 24,
										paddingBottom: 20,
									}}
								>
									<svg
										width="164"
										height="104"
										viewBox="0 0 164 104"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M2 102.498C2 61.4999 69.5 15.4999 162 10.4785M162 10.4785L133.5 1.50183M162 10.4785L141.562 31.6153"
											stroke="url(#paint0_linear_54_5088)"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<defs>
											<linearGradient
												id="paint0_linear_54_5088"
												x1="82"
												y1="1.50183"
												x2="82"
												y2="102.498"
												gradientUnits="userSpaceOnUse"
											>
												<stop stopColor="#97A1FF" />
												<stop offset="1" stopColor="#FFB571" />
											</linearGradient>
										</defs>
									</svg>
								</div>
								<h3 className="wm-title">Confirm the message</h3>
								<h4 className="wm-subtitle">
									We need you to sign your password so we can generate you a unique communication key
								</h4>
							</div>
						</>
					)}

					<div className="wm-footer">
						<ActionButton size={ActionButtonSize.LARGE} onClick={() => setStep(Step.ENTER_PASSWORD)}>
							Back
						</ActionButton>
					</div>
				</>
			) : step === Step.PUBLISH_KEY ? (
				<>
					<div className="wm-body centered">
						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'flex-start',
								justifyContent: 'flex-end',
								paddingRight: 24,
								paddingBottom: 20,
							}}
						>
							<svg
								width="164"
								height="104"
								viewBox="0 0 164 104"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M2 102.498C2 61.4999 69.5 15.4999 162 10.4785M162 10.4785L133.5 1.50183M162 10.4785L141.562 31.6153"
									stroke="url(#paint0_linear_54_5088)"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<defs>
									<linearGradient
										id="paint0_linear_54_5088"
										x1="82"
										y1="1.50183"
										x2="82"
										y2="102.498"
										gradientUnits="userSpaceOnUse"
									>
										<stop stopColor="#97A1FF" />
										<stop offset="1" stopColor="#FFB571" />
									</linearGradient>
								</defs>
							</svg>
						</div>
						<h3 className="wm-title">Confirm the transaction</h3>
						<h4 className="wm-subtitle">
							Please sign the transaction in your wallet to publish your unique communication key
						</h4>
					</div>
					<div className="wm-footer">
						<ActionButton
							size={ActionButtonSize.LARGE}
							onClick={() =>
								setStep(
									wallet.factory.blockchainGroup === 'evm'
										? Step.SELECT_NETWORK
										: Step.ENTER_PASSWORD,
								)
							}
						>
							Back
						</ActionButton>
					</div>
				</>
			) : step === Step.PUBLISHING_KEY ? (
				<>
					<div className="wm-body centered">
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								paddingBottom: 40,
							}}
						>
							<YlideLoader />
						</div>
						<h3 className="wm-title">Publishing the key</h3>
						<h4 className="wm-subtitle">Please, wait for the transaction to be completed</h4>
					</div>
				</>
			) : (
				assertUnreachable(step)
			)}
		</Modal>
	);
}
