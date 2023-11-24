import { TVMWalletController } from '@ylide/everscale';
import { asyncDelay } from '@ylide/sdk';
import clsx from 'clsx';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';

import { FeedManagerApi } from '../../api/feedManagerApi';
import { APP_NAME } from '../../constants';
import { analytics } from '../../stores/Analytics';
import { browserStorage } from '../../stores/browserStorage';
import domain from '../../stores/Domain';
import { feedSettings } from '../../stores/FeedSettings';
import { DomainAccount } from '../../stores/models/DomainAccount';
import { connectAccount, ConnectAccountResult, disconnectAccount, formatAccountName } from '../../utils/account';
import { invariant } from '../../utils/assert';
import { addressesEqual } from '../../utils/blockchain';
import { checkout, CheckoutResult, isPaid, isTrialActive, useCheckoutSearchParams } from '../../utils/payments';
import { truncateAddress } from '../../utils/string';
import { useLatest } from '../../utils/useLatest';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../ActionButton/ActionButton';
import { ActionModal } from '../actionModal/actionModal';
import { GridRowBox } from '../boxes/boxes';
import { CoverageModal } from '../coverageModal/coverageModal';
import { IosInstallPwaPopup } from '../iosInstallPwaPopup/iosInstallPwaPopup';
import { LoadingModal } from '../loadingModal/loadingModal';
import { Modal } from '../modal/modal';
import { toast } from '../toast/toast';
import css from './mainViewOnboarding.module.scss';

export interface ConnectAccountFlowProps {
	onClose: (result: ConnectAccountResult | undefined) => void;
}

export const ConnectAccountFlow = observer(({ onClose }: ConnectAccountFlowProps) => {
	const noCloseButton = !domain.accounts.accounts.length;
	const onCloseRef = useLatest(onClose);

	useEffect(() => {
		(async () => {
			try {
				analytics.mainviewOnboardingEvent('start');
				const caResult = await connectAccount({ noCloseButton, place: 'mv_onboarding' });
				if (caResult?.account) {
					analytics.mainviewOnboardingEvent('account-connected');
				}
				onCloseRef.current(caResult);
			} catch (e) {
				onCloseRef.current(undefined);
			}
		})();
	}, [noCloseButton, onCloseRef]);

	return (
		<>
			<LoadingModal reason="Connecting account ..." />

			<IosInstallPwaPopup />
		</>
	);
});

//

export interface AuthorizeAccountFlowProps {
	account: DomainAccount;
	password: string;
	onClose: (account?: DomainAccount) => void;
}

export const AuthorizeAccountFlow = observer(({ account, password, onClose }: AuthorizeAccountFlowProps) => {
	const onCloseRef = useLatest(onClose);

	useEffect(() => {
		(async () => {
			try {
				const payload = await account.makeMainViewKey(password);
				invariant(payload);
				const { token } = await FeedManagerApi.authAddress(payload, browserStorage.referrer);
				account.mainViewKey = token;
				analytics.mainviewOnboardingEvent('account-authorized');
				onCloseRef.current(account);
			} catch (e) {
				analytics.mainviewOnboardingEvent('authorization-error');
				onCloseRef.current();
			}
		})();
	}, [account, onCloseRef, password]);

	return <LoadingModal reason="Authorization ..." />;
});

//

export interface PaymentFlowProps {
	account: DomainAccount;
	onPaid: () => void;
	onCancel: () => void;
}

export const PaymentFlow = observer(({ account, onPaid, onCancel }: PaymentFlowProps) => {
	const paymentInfoQuery = useQuery(['payments', 'info', 'account', account.mainViewKey], {
		queryFn: async () => {
			const data = await FeedManagerApi.getPaymentInfo({ token: account.mainViewKey });
			return {
				...data,
				isTrialActive: isTrialActive(data),
				isPaid: isPaid(data),
			};
		},
	});

	const checkoutMutation = useMutation({
		mutationFn: (variables: { type: FeedManagerApi.PaymentType }) => {
			analytics.mainviewOnboardingEvent('payment-start', { payment_type: variables.type });
			return checkout(account, variables.type);
		},
		onError: (e, variables) => {
			console.error(e);
			analytics.mainviewOnboardingEvent('payment-start-error', { payment_type: variables.type });
			toast('Failed to open payments page 😟');
		},
	});

	useEffect(() => {
		if (paymentInfoQuery.data?.isPaid) {
			onPaid();
		} else if (paymentInfoQuery.data?.isTrialActive) {
			analytics.mainviewOnboardingEvent('trial-in-progress-dialog');
		} else if (paymentInfoQuery.data) {
			analytics.mainviewOnboardingEvent('payment-dialog');
		}
	}, [onPaid, paymentInfoQuery.data]);

	return (
		<>
			{paymentInfoQuery.isLoading || paymentInfoQuery.data?.isPaid ? (
				<LoadingModal reason="Loading payment details ..." />
			) : paymentInfoQuery.data?.isTrialActive ? (
				<ActionModal
					title="Welcome to Mainview!"
					buttons={
						<ActionButton
							size={ActionButtonSize.XLARGE}
							look={ActionButtonLook.PRIMARY}
							onClick={() => onPaid()}
						>
							Continue
						</ActionButton>
					}
				>
					Your free 7-day trial period has started. Utilize full access to the smart news aggregator
					personalized to your crypto holdings. Experience the full power of our product without any
					limitations and master your portfolio to boost your returns.
				</ActionModal>
			) : paymentInfoQuery.data ? (
				<Modal className={css.payModal}>
					<div className={css.payModalTitle}>Save 50% for 12 months</div>

					<div className={css.payModalDescription}>
						Pick your subscription. Use the special offer to purchase the annual subscription and save 50%.
						Or start a monthly subscription. You can cancel the monthly subscription at any time.
					</div>

					<div className={css.payModalPlans}>
						<div className={css.payModalPlan}>
							<div className={css.payModalPlanTitle}>Monthly subscription</div>
							<div className={css.payModalPrice}>$9/month</div>
							<div className={clsx(css.payModalSubtle, css.payModalAboveCra)}>Cancel anytime</div>
							<ActionButton
								className={css.payModalCra}
								isLoading={
									checkoutMutation.isLoading &&
									checkoutMutation.variables?.type === FeedManagerApi.PaymentType.SUBSCRIPTION
								}
								size={ActionButtonSize.XLARGE}
								look={ActionButtonLook.PRIMARY}
								onClick={() =>
									checkoutMutation.mutate({ type: FeedManagerApi.PaymentType.SUBSCRIPTION })
								}
							>
								Subscribe
							</ActionButton>
						</div>

						<div className={css.payModalPlan}>
							<div className={css.payModalPlanTitle}>Annual Plan</div>
							<GridRowBox>
								<div className={clsx(css.payModalPrice, css.payModalPrice_old)}>$108</div>
								<div className={css.payModalBadge}>50% OFF</div>
							</GridRowBox>
							<div className={clsx(css.payModalPrice, css.payModalAboveCra)}>$54/year</div>
							<ActionButton
								className={css.payModalCra}
								isLoading={
									checkoutMutation.isLoading &&
									checkoutMutation.variables?.type === FeedManagerApi.PaymentType.PAYMENT
								}
								size={ActionButtonSize.XLARGE}
								look={ActionButtonLook.HEAVY}
								onClick={() => checkoutMutation.mutate({ type: FeedManagerApi.PaymentType.PAYMENT })}
							>
								Pay Now
							</ActionButton>
						</div>
					</div>

					<ActionButton
						className={css.payModalDisconnectButton}
						size={ActionButtonSize.MEDIUM}
						look={ActionButtonLook.LITE}
						onClick={onCancel}
					>
						Use another account · {formatAccountName(account)}
					</ActionButton>
				</Modal>
			) : (
				<ActionModal
					title="Failed to fetch payment details 😟"
					buttons={
						<ActionButton
							size={ActionButtonSize.LARGE}
							look={ActionButtonLook.HEAVY}
							onClick={() => paymentInfoQuery.refetch()}
						>
							Try Again
						</ActionButton>
					}
				/>
			)}
		</>
	);
});

interface PaymentSuccessFlowProps {
	account: DomainAccount;
	onClose: (isPaid: boolean) => void;
}

export function PaymentSuccessFlow({ account, onClose }: PaymentSuccessFlowProps) {
	const startTime = useMemo(() => Date.now(), []);

	const paymentInfo = useQuery(['payment-success', account.mainViewKey], {
		queryFn: () => {
			invariant(Date.now() - startTime < 1000 * 60);

			return FeedManagerApi.getPaymentInfo({ token: account.mainViewKey });
		},
		onSuccess: info => {
			if (isPaid(info)) {
				analytics.mainviewOnboardingEvent('successful-payment-confirmed');
			}
		},
		onError: () => {
			analytics.mainviewOnboardingEvent('successful-payment-error');
			onClose(false);
		},
		refetchInterval: 5000,
	});

	return (
		<>
			<LoadingModal reason="Processing payment ..." />

			{paymentInfo.data && isPaid(paymentInfo.data) && (
				<ActionModal
					title="Payment Successful"
					buttons={
						<ActionButton
							size={ActionButtonSize.XLARGE}
							look={ActionButtonLook.PRIMARY}
							onClick={() => onClose(true)}
						>
							Continue
						</ActionButton>
					}
				>
					Your payment has been successfully processed.
				</ActionModal>
			)}
		</>
	);
}

//

export interface BuildFeedFlowProps {
	account: DomainAccount;
	onClose: (result: boolean) => void;
}

export const BuildFeedFlow = observer(({ account, onClose }: BuildFeedFlowProps) => {
	const onCloseRef = useLatest(onClose);
	const coverage = feedSettings.coverages.get(account);

	useEffect(() => {
		(async () => {
			try {
				const token = account.mainViewKey;
				invariant(token, 'No main view key');

				const res = await FeedManagerApi.init(
					token,
					account.wallet.controller instanceof TVMWalletController ? account.wallet.wallet : undefined,
				);

				if (res?.inLine) {
					async function checkInit() {
						await asyncDelay(5000);
						const initiated = await FeedManagerApi.checkInit(token);
						if (!initiated) {
							await checkInit();
						}
					}

					await checkInit();
				}

				analytics.mainviewOnboardingEvent('feed-initialized');
			} catch (e) {
				console.error(e);
				analytics.mainviewOnboardingEvent('feed-initialization-error');
				onCloseRef.current(false);
			}
		})();
	}, [account, onCloseRef]);

	return (
		<>
			{!coverage || coverage === 'loading' || coverage === 'error' ? (
				<ActionModal
					title="We're setting up your personalized feed"
					buttons={<ActionButton isLoading size={ActionButtonSize.XLARGE} look={ActionButtonLook.PRIMARY} />}
				>
					We're currently fetching data about your tokens and transactions to create a tailored experience
					just for you. This may take a few moments. Thank you for your patience.
				</ActionModal>
			) : (
				<CoverageModal coverage={coverage} onClose={() => onClose(true)} />
			)}
		</>
	);
});

//

export const isOnboardingInProgress = observable.box(false);

enum StepType {
	CONNECT_ACCOUNT = 'CONNECT_ACCOUNT',
	CONNECT_ACCOUNT_WARNING = 'CONNECT_ACCOUNT_WARNING',
	AUTHORIZATION = 'AUTHORIZATION',
	PAYMENT = 'PAYMENT',
	PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
	PAYMENT_FAILURE = 'PAYMENT_FAILURE',
	BUILDING_FEED = 'BUILDING_FEED',
	FATAL_ERROR = 'FATAL_ERROR',
}

interface ConnectAccountStep {
	type: StepType.CONNECT_ACCOUNT;
}

interface ConnectAccountWarningStep {
	type: StepType.CONNECT_ACCOUNT_WARNING;
}

interface AuthorizationStep {
	type: StepType.AUTHORIZATION;
	account: DomainAccount;
	password: string;
}

interface PaymentStep {
	type: StepType.PAYMENT;
	account: DomainAccount;
}

interface PaymentSuccessStep {
	type: StepType.PAYMENT_SUCCESS;
	account: DomainAccount;
}

interface PaymentFailureStep {
	type: StepType.PAYMENT_FAILURE;
	account: DomainAccount;
}

interface BuildingFeedStep {
	type: StepType.BUILDING_FEED;
	account: DomainAccount;
}

interface FatalErrorStep {
	type: StepType.FATAL_ERROR;
}

type Step =
	| ConnectAccountStep
	| ConnectAccountWarningStep
	| AuthorizationStep
	| PaymentStep
	| PaymentSuccessStep
	| PaymentFailureStep
	| BuildingFeedStep
	| FatalErrorStep;

export const MainViewOnboarding = observer(() => {
	const [step, setStep] = useState<Step>();
	isOnboardingInProgress.set(!!step);
	const [searchParams] = useSearchParams();

	const accounts = domain.accounts.accounts;
	const checkoutSearchParams = useCheckoutSearchParams();

	const paymentInfoQuery = useQuery(
		['payments', 'info', 'all-accounts', accounts.map(a => a.mainViewKey).join(',')],
		() =>
			Promise.all(
				accounts.map(a =>
					FeedManagerApi.getPaymentInfo({ token: a.mainViewKey })
						.then(info => ({
							address: a.account.address,
							isTrialActive: isTrialActive(info),
							isPaid: isPaid(info),
						}))
						.catch(e => {
							console.error('Failed to load payment info', e);

							// Skip failed requests. Do nothing about it
							return undefined;
						}),
				),
			),
	);

	const reset = useCallback(() => {
		setStep(undefined);
	}, []);

	// Disconnect inactive accounts before begin
	useEffect(() => {
		const referrer = searchParams.get('referrer');
		if (referrer) {
			browserStorage.referrer = referrer;
		}
		domain.accounts.accounts
			.filter(a => !a.isAnyLocalPrivateKeyRegistered)
			.forEach(a => disconnectAccount({ account: a }));
	}, []);

	// Launch onboarding
	useEffect(() => {
		// Do nothing if something is happening already
		if (step) return;

		if (!accounts.length) {
			return setStep({ type: StepType.CONNECT_ACCOUNT });
		}

		const unauthAccount = accounts.find(a => !a.mainViewKey);
		if (unauthAccount) {
			return setStep({ type: StepType.AUTHORIZATION, account: unauthAccount, password: '' });
		}

		if (checkoutSearchParams.result) {
			checkoutSearchParams.reset();

			const account = accounts.find(a => addressesEqual(a.account.address, checkoutSearchParams.address));
			if (!account) {
				toast(
					`Account ${truncateAddress(
						checkoutSearchParams.address,
					)} not connected. Please connect it to proceed.`,
				);
				return reset();
			}

			analytics.mainviewOnboardingEvent('payment-finish', {
				payment_type: checkoutSearchParams.type,
				payment_result: checkoutSearchParams.result,
			});

			if (checkoutSearchParams.result === CheckoutResult.SUCCESS) {
				return setStep({
					type: StepType.PAYMENT_SUCCESS,
					account,
				});
			} else {
				return setStep({
					type: StepType.PAYMENT_FAILURE,
					account,
				});
			}
		}

		const unpaidAccount = accounts.find(a =>
			paymentInfoQuery.data?.some(
				info => info && addressesEqual(info.address, a.account.address) && !info.isPaid && !info.isTrialActive,
			),
		);
		if (unpaidAccount) {
			return setStep({ type: StepType.PAYMENT, account: unpaidAccount });
		}
	}, [accounts, checkoutSearchParams, paymentInfoQuery.data, reset, step]);

	return (
		<>
			{step && <LoadingModal />}

			{step?.type === StepType.CONNECT_ACCOUNT && (
				<ConnectAccountFlow
					onClose={res => {
						if (res?.account) {
							setStep({
								type: StepType.AUTHORIZATION,
								account: res.account,
								password: res.password || '',
							});
						} else if (!accounts.length) {
							setStep({ type: StepType.CONNECT_ACCOUNT_WARNING });
						} else {
							reset();
						}
					}}
				/>
			)}

			{step?.type === StepType.CONNECT_ACCOUNT_WARNING && (
				<ActionModal
					title="Connect Account"
					buttons={
						<ActionButton
							size={ActionButtonSize.XLARGE}
							look={ActionButtonLook.PRIMARY}
							onClick={() => setStep({ type: StepType.CONNECT_ACCOUNT })}
						>
							Proceed
						</ActionButton>
					}
				>
					You need to connect a crypto wallet in order to use {APP_NAME} 👍
				</ActionModal>
			)}

			{step?.type === StepType.AUTHORIZATION && (
				<AuthorizeAccountFlow
					account={step.account}
					password={step.password}
					onClose={account => {
						if (account) {
							setStep({ type: StepType.PAYMENT, account });
						} else {
							setStep({ type: StepType.FATAL_ERROR });
						}
					}}
				/>
			)}

			{step?.type === StepType.PAYMENT && (
				<PaymentFlow
					account={step.account}
					onPaid={() => setStep({ type: StepType.BUILDING_FEED, account: step.account })}
					onCancel={async () => {
						await disconnectAccount({ account: step.account, place: 'mv-onboarding_payments' });
						setStep({ type: StepType.CONNECT_ACCOUNT });
					}}
				/>
			)}

			{step?.type === StepType.PAYMENT_SUCCESS && (
				<PaymentSuccessFlow
					account={step.account}
					onClose={isPaid => {
						if (isPaid) {
							setStep({ type: StepType.BUILDING_FEED, account: step.account });
						} else {
							setStep({ type: StepType.FATAL_ERROR });
						}
					}}
				/>
			)}

			{step?.type === StepType.PAYMENT_FAILURE && (
				<ActionModal
					title="Payment Failed"
					buttons={
						<ActionButton
							size={ActionButtonSize.XLARGE}
							look={ActionButtonLook.HEAVY}
							onClick={() => setStep({ type: StepType.PAYMENT, account: step.account })}
						>
							Go Back
						</ActionButton>
					}
				>
					Your payment was not processed.
				</ActionModal>
			)}

			{step?.type === StepType.BUILDING_FEED && (
				<BuildFeedFlow
					account={step.account}
					onClose={result => {
						if (result) {
							toast(`Welcome to ${APP_NAME} 🔥`);
						} else {
							setStep({ type: StepType.FATAL_ERROR });
						}

						reset();
					}}
				/>
			)}

			{step?.type === StepType.FATAL_ERROR && (
				<ActionModal
					title="Oops!"
					buttons={
						<ActionButton
							size={ActionButtonSize.XLARGE}
							look={ActionButtonLook.HEAVY}
							onClick={() => location.reload()}
						>
							Reload
						</ActionButton>
					}
				>
					Unexpected error occured. We really don't know what to do 🤷‍♂️ Please try to reload the page.
				</ActionModal>
			)}
		</>
	);
});
