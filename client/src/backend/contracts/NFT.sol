// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Pool.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFT is ERC721A, Ownable, ReentrancyGuard {
    ERC20 public methereumToken;
    Pool private poolContract;

    string public constant uriSuffix = '.json';

    uint256 public immutable max_supply = 8000;

    uint public amountMintPerAccount = 1;

    bool public whitelistEnabled = true;
    address[] private whitelistedAddresses;

    bool public publicSaleEnabled;

    string private constant unkownNotRevealedUri = "Not revealed yet";
    string[20] private unknownUris; // 20 unkown to be revealed one by one as the story progresses.

    uint256 public price;
    
    event MintSuccessful(
        address user
    );

    constructor(address ownerAddress, address teamAddress1, address teamAddress2, address[] memory _usersToWhitelist) ERC721A("Metha NFT", "MT")
    {
        // methereumToken = ERC20(methereumTokenAddress);
        // poolContract = Pool(poolAddress);

        // Set whitelist
        delete whitelistedAddresses;
        whitelistedAddresses = _usersToWhitelist;

        // Mint 75 NFTs for each team wallet
        _mint(teamAddress1, 75);
        _mint(teamAddress2, 75);

        // Transfer ownership
        _transferOwnership(ownerAddress);
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), 'ERC721Metadata: URI query for nonexistent token ');

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, Strings.toString(_tokenId), uriSuffix))
            : '';
    }

    // function mint(uint256 quantity) external payable {
    //     require(methereumToken.balanceOf(msg.sender) > 0, 'Have to hold Methereum Token to mint');
    //     require(totalSupply() + quantity < max_supply, 'Cannot mint more than max supply');
    //     require(publicSaleEnabled || isWhitelisted(address(msg.sender)), 'You are not whitelisted');
    //     require(balanceOf(msg.sender) < amountMintPerAccount, 'Each address may only mint x NFTs!');
    //     require(msg.value >= getPrice(), "Not enough ETH sent; check price!");
    //     _mint(msg.sender, quantity);
        
    //     emit MintSuccessful(msg.sender);
    // }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://Qmbx9io6LppmpvavX3EqZY8igQxPZh7koUzW3mPRLkLQir/";
    }
    
    function baseTokenURI() public pure returns (string memory) {
        return _baseURI();
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://QmWBjrx4QnwwLWzu1GosaLw1wv3ikvC5Tq7sJUcqEzr3So/";
    }

    function setPublicSaleEnabled(bool _state) public onlyOwner {
        publicSaleEnabled = _state;
    }

    function getPrice() view public returns(uint) {
        return price;
    }

    function setPrice(uint _price) public onlyOwner {
        price = _price;
    }

    function setAmountMintPerAccount(uint _amountMintPerAccount) public onlyOwner {
        amountMintPerAccount = _amountMintPerAccount;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function settleMonth(uint256 _winnerTeam) external onlyOwner {
        uint256 _fundsCollected = address(this).balance;
        uint256 _reward = _fundsCollected / 1000;

        (bool success, ) = payable(address(poolContract)).call{value: _fundsCollected}("");
        require(success, "Claim failed");

        poolContract.distributeReward(_winnerTeam, _reward);
    }

    function claimReward(uint256 _tokenId) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender, 'You need to own this token');
        poolContract.claimReward(msg.sender);
    }
}