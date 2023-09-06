import { Uint256 } from '@ylide/sdk';

import { VENOM_FEED_ID } from '../../constants';
import { BlockchainName } from '../../utils/blockchain';
import _defaultBannerSrc from './bannerImages/_default.png';
import altsomeBannerSrc from './bannerImages/altsome.jpg';
import auroraAfricaBannerSrc from './bannerImages/auroraAfrica.jpg';
import auroraBrazilBannerSrc from './bannerImages/auroraBrazil.jpg';
import auroraChinaBannerSrc from './bannerImages/auroraChina.jpg';
import auroraEastEuropeBannerSrc from './bannerImages/auroraEastEurope.jpg';
import auroraHuntersBannerSrc from './bannerImages/auroraHunters.jpg';
import auroraIndiaBannerSrc from './bannerImages/auroraIndia.jpg';
import auroraIndonesiaBannerSrc from './bannerImages/auroraIndonesia.jpg';
import auroraLatamBannerSrc from './bannerImages/auroraLatam.jpg';
import auroraTurkeyBannerSrc from './bannerImages/auroraTurkey.jpg';
import auroraVenezuelaBannerSrc from './bannerImages/auroraVenezuela.jpg';
import auroraVietnamBannerSrc from './bannerImages/auroraVietnam.jpg';
import aurorityBannerSrc from './bannerImages/aurority.jpg';
import betFuryBannerSrc from './bannerImages/betFury.jpg';
import chepeGamesBannerSrc from './bannerImages/chepeGames.jpg';
import dexifyBannerSrc from './bannerImages/dexify.jpg';
import dittoBannerSrc from './bannerImages/ditto.jpg';
import gnosisBuildersBannerSrc from './bannerImages/gnosisBuilders.jpg';
import gravixBannerSrc from './bannerImages/gravix.jpg';
import hanmadiBannerSrc from './bannerImages/hanmadi.jpg';
import oasisGalleryBannerSrc from './bannerImages/oasisGallery.jpg';
import oneClickCryptoBannerSrc from './bannerImages/oneClickCrypto.jpg';
import raveBannerSrc from './bannerImages/rave.jpg';
import revoltBannerSrc from './bannerImages/revolt.jpg';
import snipaBannerSrc from './bannerImages/snipa.jpg';
import staxBannerSrc from './bannerImages/stax.jpg';
import tvmBannerSrc from './bannerImages/tvm.jpg';
import venomApeClubBannerSrc from './bannerImages/venomApeClub.jpg';
import venomartBannerSrc from './bannerImages/venomart.jpg';
import venomBlockchainBannerSrc from './bannerImages/venomBlockchain.jpg';
import venomBridgeBannerSrc from './bannerImages/venomBridge.jpg';
import venomIdBannerSrc from './bannerImages/venomId.jpg';
import venomRecapBannerSrc from './bannerImages/venomRecap.jpg';
import ventoryBannerSrc from './bannerImages/ventory.jpg';
import web3WorldBannerSrc from './bannerImages/web3World.jpg';
import altsomeSrc from './profileImages/altsome.jpg';
import auroraAfricaSrc from './profileImages/auroraAfrica.jpg';
import auroraBrazilSrc from './profileImages/auroraBrazil.jpg';
import auroraChinaSrc from './profileImages/auroraChina.jpg';
import auroraEastEuropeSrc from './profileImages/auroraEastEurope.jpg';
import auroraHuntersSrc from './profileImages/auroraHunters.jpg';
import auroraIndiaSrc from './profileImages/auroraIndia.jpg';
import auroraIndonesiaSrc from './profileImages/auroraIndonesia.jpg';
import auroraLatamSrc from './profileImages/auroraLatam.jpg';
import auroraTurkeySrc from './profileImages/auroraTurkey.jpg';
import auroraVenezuelaSrc from './profileImages/auroraVenezuela.jpg';
import auroraVietnamSrc from './profileImages/auroraVietnam.jpg';
import auroritySrc from './profileImages/aurority.jpg';
import betFurySrc from './profileImages/betFury.jpg';
import chepeGamesSrc from './profileImages/chepeGames.jpg';
import dexifySrc from './profileImages/dexify.jpg';
import dittoSrc from './profileImages/ditto.jpg';
import ethWhalesSrc from './profileImages/ethWhales.png';
import generalSrc from './profileImages/general.png';
import gnosisBuildersSrc from './profileImages/gnosisBuilders.jpg';
import gravixSrc from './profileImages/gravix.jpg';
import hanmadiSrc from './profileImages/hanmadi.jpg';
import oasisGallerySrc from './profileImages/oasisGallery.png';
import oneClickCryptoSrc from './profileImages/oneClickCrypto.jpg';
import raveSrc from './profileImages/rave.jpg';
import revoltSrc from './profileImages/revolt.jpg';
import snipaSrc from './profileImages/snipa.png';
import staxSrc from './profileImages/stax.jpg';
import tvmSrc from './profileImages/tvm.png';
import venomApeClubSrc from './profileImages/venomApeClub.jpg';
import venomartSrc from './profileImages/venomart.jpg';
import venomBlockchainSrc from './profileImages/venomBlockchain.png';
import venomBridgeSrc from './profileImages/venomBridge.png';
import venomIdSrc from './profileImages/venomId.jpg';
import venomRecapSrc from './profileImages/venomRecap.jpg';
import ventorySrc from './profileImages/ventory.png';
import weaverSrc from './profileImages/weaver.jpg';
import web3WorldSrc from './profileImages/web3World.png';
import ylideSrc from './profileImages/ylide.png';

function inputToBlockchainProject(input: BlockchainProject | BlockchainProjectId): BlockchainProject {
	return typeof input === 'string' ? getBlockchainProjectById(input) : input;
}

export function getBlockchainProjectById(id: BlockchainProjectId) {
	return blockchainProjects.find(p => p.id === id)!;
}

export function getBlockchainProjectBannerImage(input: BlockchainProject | BlockchainProjectId) {
	return inputToBlockchainProject(input).bannerImage || _defaultBannerSrc;
}

//

export interface BlockchainProject {
	id: BlockchainProjectId;
	feedId: {
		official?: Uint256;
		discussion?: Uint256;
	};
	name: string;
	description?: string;
	profileImage?: string;
	bannerImage?: string;
	website?: string;
	tags?: BlockchainProjectTag[];
	fixedChain?: string;
	allowedChains?: string[];
	attachmentMode?: BlockchainProjectAttachmentMode;
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
	STAX = 'stax',
	VENOM_ID = 'venom_id',
	VENOM_RECAP = 'venom_recap',
	VENOM_APE_CLUB = 'venom_ape_club',
	RAVE = 'rave',
	VENOMART = 'venomart',
	REVOLT = 'revolt',
	CHEPE_GAMES = 'chepe_games',
	DEXIFY = 'dexify',

	// AURORA

	AURORA_AFRICA = 'aurora_africa',
	AURORA_BRAZIL = 'aurora_brazil',
	AURORA_CHINA = 'aurora_china',
	AURORA_EAST_EUROPE = 'aurora_east_europe',
	AURORA_INDIA = 'aurora_india',
	AURORA_INDONESIA = 'aurora_indonesia',
	AURORA_LATAM = 'aurora_latam',
	AURORA_TURKIYE = 'aurora_turkiye',
	AURORA_VENEZUELA = 'aurora_venezuela',
	AURORA_HUNTERS = 'aurora_hunters',
	AURORA_VIETNAM = 'aurora_vietnam',
	AURORA_AURORITY = 'aurora_aurority',

	// OTHERS

	TVM = 'tvm',
	HANMADI = 'hanmadi',
	WEAVER = 'weaver',
	ONE_CLICK_CRYPTO = 'one_click_crypto',
	GNOSIS_BUILDERS = 'gnosis_builders',
	BET_FURY = 'bet_fury',
	DITTO_NETWORK = 'ditto_network',
	ALTSOME = 'altsome',

	// TEST

	TEST_B87O0G5K = 'test_b87o0g5k',
}

export enum BlockchainProjectTag {
	SOCIAL = 'Social',
	VENOM = 'Venom',
	NFT = 'NFT',
	DEFI = 'DeFi',
	ECOSYSTEM = 'Ecosystem',
	TVM = 'TVM',
	GAMING = 'Gaming',
	DEVELOPER_TOOLS = 'Developer Tools',
	AURORA_ECOSYSTEM = 'Aurora Ecosystem',
}

export enum BlockchainProjectAttachmentMode {
	ADMINS = 'ADMINS',
	EVERYONE = 'EVERYONE',
}

const allChainsExceptTest = Object.values(BlockchainName).filter(
	chain =>
		![
			BlockchainName.SOLANA,
			BlockchainName.NEAR,
			BlockchainName.BASE,
			BlockchainName.ZETA,
			BlockchainName.LINEA,
		].includes(chain),
);

export const blockchainProjects: BlockchainProject[] = [
	// GENERAL

	{
		id: BlockchainProjectId.GENERAL,
		feedId: {
			discussion: '2000000000000000000000000000000000000000000000000000000000000003' as Uint256,
		},
		name: 'General chat',
		description: 'General chat to meet your web3 frens.',
		profileImage: generalSrc,
		allowedChains: allChainsExceptTest,
	},
	{
		id: BlockchainProjectId.ETH_WHALES,
		feedId: {
			discussion: '2000000000000000000000000000000000000000000000000000000000000004' as Uint256,
		},
		name: 'ETH Whales',
		description: 'Here you can meet the fellow ETH supporters. Btw, messages are sent only via Ethereum chain.',
		profileImage: ethWhalesSrc,
		tags: [BlockchainProjectTag.ECOSYSTEM],
		allowedChains: [BlockchainName.ETHEREUM],
		attachmentMode: BlockchainProjectAttachmentMode.EVERYONE,
	},
	{
		id: BlockchainProjectId.YLIDE,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000000f' as Uint256,
			discussion: '100000000000000000000000000000000000000000000000000000000000000f' as Uint256,
		},
		name: 'Ylide',
		description: 'Protocol for wallet-to-wallet communication with built-in payments.',
		profileImage: ylideSrc,
		website: 'https://ylide.io/',
		tags: [BlockchainProjectTag.SOCIAL, BlockchainProjectTag.VENOM],
		allowedChains: allChainsExceptTest,
	},

	// VENOM

	{
		id: BlockchainProjectId.OASIS_GALLERY,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000006' as Uint256,
			discussion: '1000000000000000000000000000000000000000000000000000000000000006' as Uint256,
		},
		name: 'oasis.gallery',
		description: "Trade unique digital assets on Venom blockchain's NFT marketplace.",
		profileImage: oasisGallerySrc,
		bannerImage: oasisGalleryBannerSrc,
		website: 'https://oasis.gallery/',
		tags: [BlockchainProjectTag.NFT, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.SNIPA,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000007' as Uint256,
			discussion: '1000000000000000000000000000000000000000000000000000000000000007' as Uint256,
		},
		name: 'Snipa',
		description: 'DeFi portfolio tracker designed for users to manage their assets.',
		profileImage: snipaSrc,
		bannerImage: snipaBannerSrc,
		website: 'https://snipa.finance/',
		tags: [BlockchainProjectTag.DEFI, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.VENOM_BLOCKCHAIN,
		feedId: {
			discussion: VENOM_FEED_ID,
		},
		name: 'Venom Blockchain',
		description: 'Versatile and innovative blockchain that offers a range of use cases across various industries.',
		profileImage: venomBlockchainSrc,
		bannerImage: venomBlockchainBannerSrc,
		website: 'https://venom.foundation/',
		tags: [BlockchainProjectTag.ECOSYSTEM, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.VENOM_BRIDGE,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000009' as Uint256,
			discussion: '1000000000000000000000000000000000000000000000000000000000000009' as Uint256,
		},
		name: 'Venom Bridge',
		description:
			'Explore the world of interchain transactions by effortlessly transferring tokens from one chain to the other.',
		profileImage: venomBridgeSrc,
		bannerImage: venomBridgeBannerSrc,
		website: 'https://venombridge.com/',
		tags: [BlockchainProjectTag.DEFI, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.WEB3_WORLD,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000000e' as Uint256,
			discussion: '100000000000000000000000000000000000000000000000000000000000000e' as Uint256,
		},
		name: 'Web3.World',
		description: 'First DEX on Venom that enables seamless trading by pooling liquidity from investors.',
		profileImage: web3WorldSrc,
		bannerImage: web3WorldBannerSrc,
		website: 'https://web3.world/',
		tags: [BlockchainProjectTag.DEFI, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.VENTORY,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000010' as Uint256,
			discussion: '1000000000000000000000000000000000000000000000000000000000000010' as Uint256,
		},
		name: 'Ventory',
		description:
			'Multichain NFT Marketplace exclusively for entertaining games & seamless experience, initially built on Venom network.',
		profileImage: ventorySrc,
		bannerImage: ventoryBannerSrc,
		website: 'https://testnet.ventory.gg/',
		tags: [BlockchainProjectTag.NFT, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.GRAVIX,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000011' as Uint256,
			discussion: '1000000000000000000000000000000000000000000000000000000000000011' as Uint256,
		},
		name: 'Gravix',
		description:
			'Derivatives DEX where you can trade a wide range of assets with up to 200x leverage and near-zero fees directly from your crypto wallet.',
		profileImage: gravixSrc,
		bannerImage: gravixBannerSrc,
		website: 'https://gravix.io/',
		tags: [BlockchainProjectTag.DEFI, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
	},
	{
		id: BlockchainProjectId.STAX,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000005' as Uint256,
			discussion: '1000000000000000000000000000000000000000000000000000000000000005' as Uint256,
		},
		name: 'Stax',
		description:
			'Stax is a unique digital platform merging art & gaming. It features 7777 unique 3D artworks & interactive games. Your NFT is a stake in Stax, with 90% profits to holders.',
		profileImage: staxSrc,
		bannerImage: staxBannerSrc,
		website: 'https://stax.live',
		tags: [BlockchainProjectTag.NFT, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.VENOM_ID,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000000a' as Uint256,
			discussion: '100000000000000000000000000000000000000000000000000000000000000a' as Uint256,
		},
		name: 'Venom ID',
		description:
			'Venom IDs are user-friendly solution for organizing your virtual identity in one simple link on the venom blockchain. Claim your Venom ID now!',
		profileImage: venomIdSrc,
		bannerImage: venomIdBannerSrc,
		website: 'https://venomid.network/',
		tags: [BlockchainProjectTag.SOCIAL, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.VENOM_RECAP,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000000b' as Uint256,
			discussion: '100000000000000000000000000000000000000000000000000000000000000b' as Uint256,
		},
		name: 'Venom Recap',
		description:
			'Discover the latest news of Venom ⚡ Supported by @sc_ventures_, and access top-tier news, insights, and knowledge on Venom.',
		profileImage: venomRecapSrc,
		bannerImage: venomRecapBannerSrc,
		website: 'https://twitter.com/VenomRecap',
		tags: [BlockchainProjectTag.SOCIAL, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.VENOM_APE_CLUB,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000000c' as Uint256,
			discussion: '100000000000000000000000000000000000000000000000000000000000000c' as Uint256,
		},
		name: 'Venom Ape Club',
		description: '3,333 rare, random & rad Apes living on Venom Network.',
		profileImage: venomApeClubSrc,
		bannerImage: venomApeClubBannerSrc,
		website: 'https://venomape.club/',
		tags: [BlockchainProjectTag.NFT, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.RAVE,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000018' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000019' as Uint256,
		},
		name: 'Rave',
		description:
			'Rave is a NFT car racing metaverse built on Venom. Rave replicates the real-life car racing experience with upgradable and customizable car NFTs, allowing ravers to collect, customize, rave and earn.',
		profileImage: raveSrc,
		bannerImage: raveBannerSrc,
		website: 'https://ravegame.net/',
		tags: [BlockchainProjectTag.GAMING, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.VENOMART,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000021' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000022' as Uint256,
		},
		name: 'Venomart',
		description:
			'Venomart is the first fully-fledged NFT Marketplace on Venom. Get quick and easy access to digital collectibles and explore, buy and sell NFTs.',
		profileImage: venomartSrc,
		bannerImage: venomartBannerSrc,
		website: 'https://venomart.io/',
		tags: [BlockchainProjectTag.NFT, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.REVOLT,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000023' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000024' as Uint256,
		},
		name: 'Revolt',
		description: 'Revolt is the First Complete 10,000 PFP Collection on #Venom Devnet.',
		profileImage: revoltSrc,
		bannerImage: revoltBannerSrc,
		website: 'https://twitter.com/RevoltNFT?s=20',
		tags: [BlockchainProjectTag.NFT, BlockchainProjectTag.VENOM],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.CHEPE_GAMES,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000002c' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000002d' as Uint256,
		},
		name: 'Chepe Games',
		description: 'Web3 gaming platform for everyone. Built on Venom Network. Play with Chepe, earn with Chepe.',
		profileImage: chepeGamesSrc,
		bannerImage: chepeGamesBannerSrc,
		website: 'https://twitter.com/Chepe_Gaming',
		tags: [BlockchainProjectTag.GAMING, BlockchainProjectTag.VENOM],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.DEXIFY,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000002e' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000002f' as Uint256,
		},
		name: 'DEXIFY',
		description: 'Building the Infrastructure for On-chain Asset Management.',
		profileImage: dexifySrc,
		bannerImage: dexifyBannerSrc,
		website: 'https://www.dexify.io/',
		tags: [BlockchainProjectTag.DEFI, BlockchainProjectTag.VENOM],
		allowedChains: [BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},

	// AURORA

	{
		id: BlockchainProjectId.AURORA_AFRICA,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000030' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000031' as Uint256,
		},
		name: 'Aurora (Africa)',
		description:
			'Aurora Africa is a regional guild focused on educating and growing the Aurora community in Africa.',
		profileImage: auroraAfricaSrc,
		bannerImage: auroraAfricaBannerSrc,
		website: 'https://t.me/AuroraAfrica',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_BRAZIL,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000032' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000033' as Uint256,
		},
		name: 'Aurora (Brazil)',
		description: 'Seja bem vindo ao grupo oficial Aurora Brasil. Aurora é a blockchain EVM da Near Protocol.',
		profileImage: auroraBrazilSrc,
		bannerImage: auroraBrazilBannerSrc,
		website: 'https://t.me/aurorabrasil',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_CHINA,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000034' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000035' as Uint256,
		},
		name: 'Aurora (China)',
		description: 'Join our awesome regional Community in China!',
		profileImage: auroraChinaSrc,
		bannerImage: auroraChinaBannerSrc,
		website: 'https://t.me/Aurora_chinese',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_EAST_EUROPE,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000036' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000037' as Uint256,
		},
		name: 'Aurora (East Europe)',
		description: 'Join our awesome regional Community in Eastern Europe!',
		profileImage: auroraEastEuropeSrc,
		bannerImage: auroraEastEuropeBannerSrc,
		website: 'https://t.me/aurora_ee',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_INDIA,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000038' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000039' as Uint256,
		},
		name: 'Aurora (India)',
		description: 'Join our awesome regional Community in India!',
		profileImage: auroraIndiaSrc,
		bannerImage: auroraIndiaBannerSrc,
		website: 'https://t.me/auroraindia',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_INDONESIA,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000003a' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000003b' as Uint256,
		},
		name: 'Aurora (Indonesia)',
		description: 'Akun official resmi Komunitas Aurora Indonesia | EVM Layer-2 NEAR Protocol | $AURORA',
		profileImage: auroraIndonesiaSrc,
		bannerImage: auroraIndonesiaBannerSrc,
		website: 'https://t.me/AuroraIndonesiaHQ',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_LATAM,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000003c' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000003d' as Uint256,
		},
		name: 'Aurora (LATAM)',
		description: 'Aurora es una L2 + EVM de NEAR Protocol. Realiza transacciones gratuitas en aurora.plus',
		profileImage: auroraLatamSrc,
		bannerImage: auroraLatamBannerSrc,
		website: 'https://t.me/AuroraLatam',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_TURKIYE,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000003e' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000003f' as Uint256,
		},
		name: 'Aurora (Türkiye)',
		description: 'Resmi Aurora Türk topluluk kanalı',
		profileImage: auroraTurkeySrc,
		bannerImage: auroraTurkeyBannerSrc,
		website: 'https://t.me/auroraisneartr',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_VENEZUELA,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000040' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000041' as Uint256,
		},
		name: 'Aurora (Venezuela)',
		description:
			'Aurora ES Near es un espacio para educar a la comunidad sobre Near Protocol y Aurora Network así como el ecosistema que los conforma.',
		profileImage: auroraVenezuelaSrc,
		bannerImage: auroraVenezuelaBannerSrc,
		website: 'https://t.me/venezuelaaurora',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_HUNTERS,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000042' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000043' as Uint256,
		},
		name: 'Aurora (Hunters)',
		description: 'Join our awesome Aurora Hunters Community!',
		profileImage: auroraHuntersSrc,
		bannerImage: auroraHuntersBannerSrc,
		website: 'https://t.me/AuroraHunters_chat',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_VIETNAM,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000044' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000045' as Uint256,
		},
		name: 'Aurora (Vietnam)',
		description: 'Kênh thông tin chính thức của Aurora tại Việt Nam.',
		profileImage: auroraVietnamSrc,
		bannerImage: auroraVietnamBannerSrc,
		website: 'https://t.me/auroravietnamofficial',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.AURORA_AURORITY,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000046' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000047' as Uint256,
		},
		name: 'Aurora (Aurority)',
		description: "Aurority's Official Discussion Chat",
		profileImage: auroritySrc,
		bannerImage: aurorityBannerSrc,
		website: 'https://t.me/auroritychat',
		tags: [BlockchainProjectTag.AURORA_ECOSYSTEM],
		allowedChains: [BlockchainName.AURORA],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
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
		profileImage: tvmSrc,
		bannerImage: tvmBannerSrc,
		tags: [BlockchainProjectTag.TVM, BlockchainProjectTag.ECOSYSTEM, BlockchainProjectTag.VENOM],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.HANMADI,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000025' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000026' as Uint256,
		},
		name: '한마디 (Hanmadi)',
		description: '누구나 자유로이 한마디!',
		profileImage: hanmadiSrc,
		bannerImage: hanmadiBannerSrc,
		tags: [BlockchainProjectTag.TVM, BlockchainProjectTag.VENOM],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.EVERYONE,
	},
	{
		id: BlockchainProjectId.WEAVER,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000001a' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000001b' as Uint256,
		},
		name: 'Weaver',
		description: '한국의 크립토 마케팅회사',
		profileImage: weaverSrc,
		tags: [BlockchainProjectTag.TVM],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.EVERYONE,
	},
	{
		id: BlockchainProjectId.ONE_CLICK_CRYPTO,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000000d' as Uint256,
			discussion: '100000000000000000000000000000000000000000000000000000000000000d' as Uint256,
		},
		name: 'One Click Crypto',
		description: 'Diversify your portfolio, save on gas fees, and generate best risk-reward yield with One Click.',
		profileImage: oneClickCryptoSrc,
		bannerImage: oneClickCryptoBannerSrc,
		website: 'https://www.oneclick.fi/',
		tags: [BlockchainProjectTag.DEFI],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.GNOSIS_BUILDERS,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000012' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000013' as Uint256,
		},
		name: 'Gnosis Builders',
		description: 'Driving the adoption and development of the @gnosischain ecosystem🦉💚',
		profileImage: gnosisBuildersSrc,
		bannerImage: gnosisBuildersBannerSrc,
		website: 'https://www.gnosis.builders/',
		tags: [BlockchainProjectTag.ECOSYSTEM, BlockchainProjectTag.SOCIAL],
		allowedChains: [BlockchainName.GNOSIS],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.BET_FURY,
		feedId: {
			official: '2000000000000000000000000000000000000000000000000000000000000016' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000017' as Uint256,
		},
		name: 'BetFury',
		description:
			'Enjoy 5000+ crypto games, fast payouts and 24/7 live support. Make the best of the superior Bitcoin Casino.',
		profileImage: betFurySrc,
		bannerImage: betFuryBannerSrc,
		website: 'https://betfury.io/',
		tags: [BlockchainProjectTag.GAMING],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.DITTO_NETWORK,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000001f' as Uint256,
			discussion: '2000000000000000000000000000000000000000000000000000000000000020' as Uint256,
		},
		name: 'Ditto Network',
		description:
			'Robust infrastructure empowering Web3 users to seamlessly connect to any application and automate any workflow both on- and off-chain.',
		profileImage: dittoSrc,
		bannerImage: dittoBannerSrc,
		website: 'https://dittonetwork.io',
		tags: [BlockchainProjectTag.DEVELOPER_TOOLS],
		allowedChains: [BlockchainName.POLYGON, BlockchainName.VENOM_TESTNET],
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},
	{
		id: BlockchainProjectId.ALTSOME,
		feedId: {
			official: '200000000000000000000000000000000000000000000000000000000000002a' as Uint256,
			discussion: '200000000000000000000000000000000000000000000000000000000000002b' as Uint256,
		},
		name: 'Altsome',
		description: 'A Hybrid Crypto Aggregator and Community Network.',
		profileImage: altsomeSrc,
		bannerImage: altsomeBannerSrc,
		website: 'https://altsome.com/',
		tags: [BlockchainProjectTag.DEFI, BlockchainProjectTag.NFT],
		allowedChains: allChainsExceptTest,
		attachmentMode: BlockchainProjectAttachmentMode.ADMINS,
	},

	// TEST

	{
		id: BlockchainProjectId.TEST_B87O0G5K,
		feedId: {
			discussion: '2000000000000000000000000000000000000000000000000000000000000027' as Uint256,
		},
		name: 'Test Feed',
		description: 'This is an amazing test feed with some description 😎',
		website: 'https://my-website.com',
		allowedChains: [BlockchainName.BASE, BlockchainName.ZETA, BlockchainName.LINEA],
		attachmentMode: BlockchainProjectAttachmentMode.EVERYONE,
	},
];
