// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CredentialNFT is ERC721, Ownable {
    // Struct to store institution information
    struct Institution {
        string name;
        bool isApproved;
    }

    // Struct to store credential data
    struct CredentialData {
        string recipientName;
        string title;
        string issuedDate;
    }

    // Mapping to track institutions
    mapping(address => Institution) public institutions;
    
    // Mapping to track NFT issuers
    mapping(uint256 => address) public nftIssuers;
    
    // Mapping to store token URIs
    mapping(uint256 => string) private _tokenURIs;

    // Mapping to store credential details
    mapping(uint256 => CredentialData) public credentialDetails;

    // Events
    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionApproved(address indexed institution);
    event CredentialIssued(address indexed issuer, address indexed recipient, uint256 tokenId);
    event CredentialBurned(uint256 tokenId);

    // Counter for token IDs
    uint256 private _tokenIdCounter;

    constructor() ERC721("CredentialNFT", "CRED") Ownable(msg.sender) {}

    // Institution registration Part A
    function registerInstitution(address _institutionAddress, string memory _name) external {
        require(_institutionAddress != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(institutions[_institutionAddress].isApproved == false, "Already registered");
        
        institutions[_institutionAddress] = Institution({
            name: _name,
            isApproved: false
        });

        emit InstitutionRegistered(_institutionAddress, _name);
    }

    // Admin approval for institutions Part A
    function approveInstitution(address _institution) external onlyOwner {
        require(institutions[_institution].isApproved == false, "Already approved");
        institutions[_institution].isApproved = true;
        emit InstitutionApproved(_institution);
    }

    // Mint NFT (only by approved institutions)
    function issueCredential(
        address _recipient,
        string memory _metadataURI,
        string memory _recipientName,
        string memory _title,
        string memory _issuedDate
    ) external {
        require(institutions[msg.sender].isApproved, "Not an approved institution");
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_issuedDate).length > 0, "Issued date cannot be empty");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(_recipient, tokenId);
        nftIssuers[tokenId] = msg.sender;
        _tokenURIs[tokenId] = _metadataURI;
        
        // Store credential details
        credentialDetails[tokenId] = CredentialData({
            recipientName: _recipientName,
            title: _title,
            issuedDate: _issuedDate
        });
        
        emit CredentialIssued(msg.sender, _recipient, tokenId);
    }

    // Override transfer functions to prevent transfers by recipients
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(
            from == address(0) || // Minting
            to == address(0) || // Burning
            msg.sender == nftIssuers[tokenId], // Only issuer can transfer
            "Only issuer can transfer this NFT"
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // Burn NFT (only by issuer)
    function burnCredential(uint256 _tokenId) external {
        require(msg.sender == nftIssuers[_tokenId], "Only issuer can burn");
        _burn(_tokenId);
        emit CredentialBurned(_tokenId);
    }

    // Verify if an address is a registered institution and get its name
    function getInstitutionInfo(address _institution) external view returns (bool isApproved, string memory name) {
        Institution memory institution = institutions[_institution];
        return (institution.isApproved, institution.name);
    }

    // Get NFT details including credential data
    function getNFTCredentialDetails(uint256 _tokenId) external view returns (
        address issuer,
        address owner,
        string memory recipientName,
        string memory title,
        string memory issuedDate,
        string memory metadataURI
    ) {
        require(_exists(_tokenId), "Token does not exist");
        CredentialData memory data = credentialDetails[_tokenId];
        return (
            nftIssuers[_tokenId],
            ownerOf(_tokenId),
            data.recipientName,
            data.title,
            data.issuedDate,
            tokenURI(_tokenId)
        );
    }
} 