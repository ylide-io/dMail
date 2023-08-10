import { Uint256 } from '@ylide/sdk';

import { VENOM_FEED_ID } from '../../constants';
import ethWhalesSrc from './profilePictures/ethWhales.png';
import generalSrc from './profilePictures/general.png';
import gravixSrc from './profilePictures/gravix.png';
import oasisGallerySrc from './profilePictures/oasisGallery.png';
import snipaSrc from './profilePictures/snipa.png';
import tvmSrc from './profilePictures/tvm.png';
import venomBlockchainSrc from './profilePictures/venomBlockchain.png';
import venomBridgeSrc from './profilePictures/venomBridge.png';
import ventorySrc from './profilePictures/ventory.png';
import web3WorldSrc from './profilePictures/web3World.png';
import ylideSrc from './profilePictures/ylide.png';

export function getBlockchainProjectById(id: BlockchainProjectId) {
	return blockchainProjects.find(p => p.id === id)!;
}

//

export interface BlockchainProject {
	id: BlockchainProjectId;
	feedId: {
		official?: Uint256;
		discussion?: Uint256;
	};
	name: string;
	description: string;
	profilePicture?: string;
	banner?: string;
	website?: string;
	tags: string[];
	onlyVenom?: boolean;
	onlyEtherium?: boolean;
}

export enum BlockchainProjectId {
	// GENERAL

	GENERAL = 'general',
	ETH_WHALES = 'eth_whales',
	YLIDE = 'ylide',

	// VENOM

	OASIS_GALLERY = 'oasis_gallery',
	SNIPA = 'snipa',
	VENOM_BLOCKCHAIN = 'venom_blockchain',
	VENOM_BRIDGE = 'venom_bridge',
	WEB3_WORLD = 'web3_world',
	VENTORY = 'ventory',
	GRAVIX = 'gravix',

	// OTHERS

	TVM = 'tvm',
	ISME_TEST = 'isme_test',
}

export const blockchainProjects: BlockchainProject[] = [
	// GENERAL

	{
		id: BlockchainProjectId.GENERAL,
		feedId: {
			discussion: '2000000000000000000000000000000000000000000000000000000000000003' as Uint256,
		},
		name: 'General chat',
		description: 'General chat to meet your web3 frens.',
		profilePicture: generalSrc,
		tags: [],
	},
	{
		id: BlockchainProjectId.ETH_WHALES,
		feedId: {
			discussion: '2000000000000000000000000000000000000000000000000000000000000004' as Uint256,
		},
		name: 'ETH Whales',
		description: 'Here you can meet the fellow ETH supporters. Btw, messages are sent only via Ethereum chain.',
		profilePicture: ethWhalesSrc,
		banner: 'https://picsum.photos/id/723/1500/500',
		tags: ['Ecosystems'],
		onlyEtherium: true,
	},
	{
		id: BlockchainProjectId.YLIDE,
		feedId: {
			discussion: '100000000000000000000000000000000000000000000000000000000000000f' as Uint256,
		},
		name: 'Ylide',
		description: 'Protocol for wallet-to-wallet communication with built-in payments.',
		profilePicture: ylideSrc,
		website: 'https://ylide.io/',
		tags: ['Social', 'Venom'],
	},

	// VENOM

	{
		id: BlockchainProjectId.OASIS_GALLERY,
		feedId: {
			discussion: '1000000000000000000000000000000000000000000000000000000000000006' as Uint256,
		},
		name: 'oasis.gallery',
		description: "Trade unique digital assets on Venom blockchain's NFT marketplace.",
		profilePicture: oasisGallerySrc,
		website: 'https://oasis.gallery/',
		tags: ['NFT', 'Venom'],
		onlyVenom: true,
	},
	{
		id: BlockchainProjectId.SNIPA,
		feedId: {
			discussion: '1000000000000000000000000000000000000000000000000000000000000007' as Uint256,
		},
		name: 'Snipa',
		description: 'DeFi portfolio tracker designed for users to manage their assets.',
		profilePicture: snipaSrc,
		website: 'https://snipa.finance/',
		tags: ['DeFi', 'Venom'],
		onlyVenom: true,
	},
	{
		id: BlockchainProjectId.VENOM_BLOCKCHAIN,
		feedId: {
			discussion: VENOM_FEED_ID,
		},
		name: 'Venom Blockchain',
		description: 'Versatile and innovative blockchain that offers a range of use cases across various industries.',
		profilePicture: venomBlockchainSrc,
		banner: 'https://picsum.photos/id/1005/1500/500',
		website: 'https://venom.foundation/',
		tags: ['Ecosystems', 'Venom'],
		onlyVenom: true,
	},
	{
		id: BlockchainProjectId.VENOM_BRIDGE,
		feedId: {
			discussion: '1000000000000000000000000000000000000000000000000000000000000009' as Uint256,
		},
		name: 'Venom Bridge',
		description:
			'Explore the world of interchain transactions by effortlessly transferring tokens from one chain to the other.',
		profilePicture: venomBridgeSrc,
		website: 'https://venombridge.com/',
		tags: ['DeFi', 'Venom'],
		onlyVenom: true,
	},
	{
		id: BlockchainProjectId.WEB3_WORLD,
		feedId: {
			discussion: '100000000000000000000000000000000000000000000000000000000000000e' as Uint256,
		},
		name: 'Web3.World',
		description: 'First DEX on Venom that enables seamless trading by pooling liquidity from investors.',
		profilePicture: web3WorldSrc,
		website: 'https://web3.world/',
		tags: ['DeFi', 'Venom'],
		onlyVenom: true,
	},
	{
		id: BlockchainProjectId.VENTORY,
		feedId: {
			discussion: '1000000000000000000000000000000000000000000000000000000000000010' as Uint256,
		},
		name: 'Ventory',
		description:
			'Multichain NFT Marketplace exclusively for entertaining games & seamless experience, initially built on Venom network.',
		profilePicture: ventorySrc,
		website: 'https://testnet.ventory.gg/',
		tags: ['NFT', 'Venom'],
		onlyVenom: true,
	},
	{
		id: BlockchainProjectId.GRAVIX,
		feedId: {
			discussion: '1000000000000000000000000000000000000000000000000000000000000011' as Uint256,
		},
		name: 'Gravix',
		description:
			'Derivatives DEX where you can trade a wide range of assets with up to 200x leverage and near-zero fees directly from your crypto wallet.',
		profilePicture: gravixSrc,
		banner: 'https://picsum.photos/id/379/1500/500',
		website: 'https://gravix.io/',
		tags: ['DeFi', 'Venom'],
		onlyVenom: true,
	},

	// OTHERS

	{
		id: BlockchainProjectId.TVM,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000001' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000002' as Uint256,
		},
		name: 'TVM 주요 업데이트',
		description: '베놈과 에버스케일을 포함한 TVM 블록체인의 주요 업데이트 내용을 공유하는 채널',
		profilePicture: tvmSrc,
		banner: 'https://picsum.photos/id/356/1500/500',
		tags: ['TVM', 'Ecosystems', 'Venom'],
	},
	{
		id: BlockchainProjectId.ISME_TEST,
		feedId: {
			discussion: '11d558ad3a44a6b7476209ccaecdfaf55462d9bb0edcc69c64c0f94f9b2ecc98' as Uint256,
		},
		name: 'isme',
		description: 'ISME Test Evm',
		website: 'https://isme.is/',
		tags: ['Blockchain', 'is.me'],
	},
];
