// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MembershipNFT
 * @dev Tiered ERC721 membership passes for creators, with per-tier pricing & royalties.
 */
contract MembershipNFT is ERC721, ERC721Enumerable, ERC2981, Ownable {
    // -------------------------
    // Tier structure
    // -------------------------
    struct Tier {
        uint256 price;        // mint price in wei
        uint256 maxSupply;    // 0 = unlimited
        uint96 royaltyBps;    // basis points (500 = 5%)
        string metadataCID;   // IPFS CID
        address creator;      // tier owner
        bool active;
        uint256 minted;
    }

    // tierId => Tier
    mapping(uint256 => Tier) private tiers;

    // creator => tierIds[]
    mapping(address => uint256[]) private creatorTiers;

    // tokenId => tierId
    mapping(uint256 => uint256) private tokenTier;

    uint256 public nextTierId = 1;
    uint256 public nextTokenId = 1;

    // -------------------------
    // Events
    // -------------------------
    event TierCreated(
        uint256 indexed tierId,
        address indexed creator,
        uint256 price,
        uint256 maxSupply,
        uint96 royaltyBps,
        string metadataCID
    );

    event TierUpdated(
        uint256 indexed tierId,
        uint256 price,
        uint256 maxSupply,
        uint96 royaltyBps,
        string metadataCID,
        bool active
    );

    event MembershipMinted(
        uint256 indexed tokenId,
        uint256 indexed tierId,
        address indexed to,
        address creator,
        uint256 price
    );

    // -------------------------
    // Constructor
    // -------------------------

    constructor()
        ERC721("SubHub Membership", "SUBMEM")
        Ownable(msg.sender) // OZ v5 Ownable requires initialOwner
    {
        // optional: set a default royalty (0 by default)
        // _setDefaultRoyalty(msg.sender, 0);
    }

    // -------------------------
    // Modifier
    // -------------------------
    modifier onlyTierCreator(uint256 tierId) {
        require(tiers[tierId].creator == msg.sender, "Not tier creator");
        _;
    }

    // -------------------------
    // Tier Management
    // -------------------------
    function createTier(
        uint256 price,
        uint256 maxSupply,
        uint96 royaltyBps,
        string calldata metadataCID
    ) external returns (uint256 tierId) {
        require(price > 0, "Price required");
        require(royaltyBps <= 10_000, "Royalty too high");
        require(bytes(metadataCID).length > 0, "CID required");

        tierId = nextTierId++;

        tiers[tierId] = Tier({
            price: price,
            maxSupply: maxSupply,
            royaltyBps: royaltyBps,
            metadataCID: metadataCID,
            creator: msg.sender,
            active: true,
            minted: 0
        });

        creatorTiers[msg.sender].push(tierId);

        emit TierCreated(tierId, msg.sender, price, maxSupply, royaltyBps, metadataCID);
    }

    function updateTier(
        uint256 tierId,
        uint256 price,
        uint256 maxSupply,
        uint96 royaltyBps,
        string calldata metadataCID,
        bool active
    ) external onlyTierCreator(tierId) {
        require(price > 0, "Price required");
        require(royaltyBps <= 10_000, "Royalty too high");

        Tier storage t = tiers[tierId];
        t.price = price;
        t.maxSupply = maxSupply;
        t.royaltyBps = royaltyBps;
        t.metadataCID = metadataCID;
        t.active = active;

        emit TierUpdated(tierId, price, maxSupply, royaltyBps, metadataCID, active);
    }

    // -------------------------
    // Mint
    // -------------------------
    function mintMembership(uint256 tierId)
        external
        payable
        returns (uint256 tokenId)
    {
        Tier storage t = tiers[tierId];
        require(t.creator != address(0), "Tier not found");
        require(t.active, "Tier inactive");
        require(msg.value == t.price, "Incorrect payment");

        if (t.maxSupply != 0) {
            require(t.minted < t.maxSupply, "Tier sold out");
        }

        tokenId = nextTokenId++;
        t.minted++;

        tokenTier[tokenId] = tierId;

        _safeMint(msg.sender, tokenId);

        // set royalty for this NFT
        _setTokenRoyalty(tokenId, t.creator, t.royaltyBps);

        // send payment to creator
        (bool sent, ) = t.creator.call{value: msg.value}("");
        require(sent, "Payment failed");

        emit MembershipMinted(tokenId, tierId, msg.sender, t.creator, msg.value);
    }

    // -------------------------
    // Views
    // -------------------------

    function getTier(uint256 tierId) external view returns (Tier memory) {
        return tiers[tierId];
    }

    function getCreatorTiers(address creator) external view returns (uint256[] memory) {
        return creatorTiers[creator];
    }

    function getTokenTier(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenTier[tokenId];
    }

    function getMembershipInfo(uint256 tokenId)
        external
        view
        returns (uint256 tierId, Tier memory tier)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        tierId = tokenTier[tokenId];
        tier = tiers[tierId];
    }

    // -------------------------
    // Metadata URI
    // -------------------------
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");

        uint256 tierId = tokenTier[tokenId];
        Tier memory t = tiers[tierId];

        return string(abi.encodePacked("ipfs://", t.metadataCID));
    }

    // -------------------------
    // Overrides for multiple inheritance
    // -------------------------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // OZ v5 requires overriding these instead of _beforeTokenTransfer
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // -------------------------
    // Admin
    // -------------------------
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function rescueETH(address to) external onlyOwner {
        uint256 bal = address(this).balance;
        (bool sent, ) = to.call{value: bal}("");
        require(sent, "Rescue failed");
    }
}
