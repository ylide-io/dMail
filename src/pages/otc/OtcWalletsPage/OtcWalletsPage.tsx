import { ReactNode, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { generatePath, useSearchParams } from 'react-router-dom';

import { OtcApi } from '../../../api/otcApi';
import { AdaptiveAddress } from '../../../components/adaptiveAddress/adaptiveAddress';
import { ErrorMessage } from '../../../components/errorMessage/errorMessage';
import { YlideLoader } from '../../../components/ylideLoader/ylideLoader';
import { RoutePath } from '../../../stores/routePath';
import { invariant } from '../../../utils/assert';
import { formatMoney } from '../../../utils/money';
import { formatNumber } from '../../../utils/number';
import { buildUrl, useNav } from '../../../utils/url';
import { OtcAsideStatistics } from '../_common/otcAsideStatistics/otcAsideStatistics';
import { OtcLayout, OtcSupContentTitle } from '../_common/otcLayout/otcLayout';
import { OtcPagination } from '../_common/otcPagination/otcPagination';
import { OtcTable } from '../_common/otcTable/otcTable';
import css from './OtcWalletsPage.module.scss';

const PAGE_SIZE = 50;

export function OtcWalletsPage() {
	const navigate = useNav();

	const [searchParams] = useSearchParams();
	const page = Number(searchParams.get('page')) || 1;
	const token = searchParams.get('token');
	const chain = searchParams.get('chain');
	invariant(token && chain);

	const { isError, data } = useQuery(['otc', 'wallets', page, token, chain], () =>
		OtcApi.queryWalletsByToken({
			token,
			query: '',
			chain: chain,
			offset: (page - 1) * PAGE_SIZE,
			limit: PAGE_SIZE,
		}),
	);

	const [aside, setAside] = useState<ReactNode>();
	useEffect(() => {
		setAside(prev =>
			data ? (
				<OtcAsideStatistics
					rows={[
						{
							title: `${formatNumber(data.totalCount)} wallets`,
							description: 'connected to Ylide',
						},
						{
							title: `${formatMoney(data.totalValue)} value`,
							description: 'connected to Ylide',
						},
					]}
				/>
			) : (
				prev
			),
		);
	}, [data]);

	return (
		<OtcLayout title={`${token} Wallets`} aside={aside} contentClass={css.content}>
			<OtcSupContentTitle>Discover assets owned by Ylide users and start a new deal</OtcSupContentTitle>

			{data ? (
				<>
					<OtcTable
						columns={[
							{
								title: 'Wallet',
								gridSize: '1fr',
								className: css.addressRow,
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
								gridSize: 'minmax(100px, 0.5fr)',
								className: css.messageRow,
							},
						]}
						data={data.wallets.map(wallet => ({
							content: [
								<AdaptiveAddress address={wallet.address} />,
								formatNumber(wallet.balance),
								formatMoney(wallet.value),
								wallet.blockchain,
								<button
									className={css.messageButton}
									onClick={() =>
										navigate(generatePath(RoutePath.OTC_CHATS_ID, { address: wallet.address }))
									}
								>
									Message
								</button>,
							],
						}))}
					/>

					<OtcPagination
						currentPage={page}
						totalPages={data.totalCount / PAGE_SIZE}
						generateUrl={forPage =>
							buildUrl({
								path: generatePath(RoutePath.OTC_WALLETS),
								search: {
									token,
									chain,
									...(forPage > 1 ? { page: forPage.toString() } : {}),
								},
							})
						}
					/>
				</>
			) : isError ? (
				<ErrorMessage>Couldn't load wallets</ErrorMessage>
			) : (
				<YlideLoader className={css.loader} reason="Loading wallets ..." />
			)}
		</OtcLayout>
	);
}
