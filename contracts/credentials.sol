// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CredentialNFT is ERC721, AccessControl, Pausable {
    uint256 private _ids;

    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    string public baseURI;

    // map tokenId → credential hash (e.g. keccak256(JSON) or IPFS CID)
    mapping(uint256 => bytes32) public credentialHash;

    constructor(address admin, string memory _baseURI) ERC721("CredNFT", "CRDT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        baseURI = _baseURI;
    }

    /// @notice Issue a credential (only an approved issuer can call)
    function mintCredential(address to, bytes32 hash)
        external
        onlyRole(ISSUER_ROLE)
        whenNotPaused
        returns (uint256)
    {
        _ids += 1;
        uint256 newId = _ids;

        credentialHash[newId] = hash;
        _safeMint(to, newId);

        return newId;
    }

    /// @notice Build the metadata URI off-chain
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Nonexistent");
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId)));
    }

    /// @notice Emergency pause/unpause
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function supportsInterface(bytes4 iid)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(iid);
    }
}
