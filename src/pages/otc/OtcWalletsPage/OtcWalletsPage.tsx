import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';

import { OtcApi } from '../../../api/otcApi';
import { ErrorMessage } from '../../../components/errorMessage/errorMessage';
import { YlideLoader } from '../../../components/ylideLoader/ylideLoader';
import { AdaptiveAddress } from '../../../controls/adaptiveAddress/adaptiveAddress';
import { invariant } from '../../../utils/invariant';
import { OtcAsideStatistics } from '../components/otcAsideStatistics/otcAsideStatistics';
import { OtcLayout } from '../components/otcLayout/otcLayout';
import { OtcTable } from '../components/otcTable/otcTable';
import css from './OtcWalletsPage.module.scss';

export function OtcWalletsPage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const chain = searchParams.get('chain');
	invariant(token && chain);

	const { isError, data } = useQuery('otc_wallets', () =>
		OtcApi.queryWalletsByToken(token, chain, null, 0, Number.MAX_SAFE_INTEGER),
	);

	return (
		<OtcLayout
			title={`${token} Wallets`}
			aside={
				data && (
					<OtcAsideStatistics
						rows={[
							{
								title: `${data.totalCount} wallets`,
								description: 'connected to Ylide',
							},
							{
								title: `${data.totalValue} value`,
								description: 'connected to Ylide',
							},
						]}
					/>
				)
			}
			supContent="Discover assets owned by Ylide users and start a new deal"
		>
			{data ? (
				<OtcTable
					columns={[
						{
							title: 'Wallet',
							gridSize: '1fr',
						},
						{
							title: 'Balance',
							gridSize: '1fr',
						},
						{
							title: 'Total Value',
							gridSize: '1fr',
						},
						{
							title: 'Chain',
							gridSize: '1fr',
						},
						{
							title: '',
							gridSize: '1fr',
						},
					]}
					data={data.wallets.map(wallet => ({
						content: [
							<AdaptiveAddress address={wallet.address} />,
							wallet.balance,
							wallet.value,
							wallet.blockchain,
							<button className={css.messageButton}>Message</button>,
						],
					}))}
				/>
			) : isError ? (
				<ErrorMessage>Couldn't load wallets</ErrorMessage>
			) : (
				<YlideLoader className={css.loader} reason="Loading wallets ..." />
			)}
		</OtcLayout>
	);
}
