// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Pool is ReentrancyGuard {
    ERC721A public nftToken;

    event ClaimSuccessful(
        address tokenOwner,
        uint256 reward
    );
    
    enum Team {
        GREEN,
        PURPLE,
        BLUE,
        YELLOW,
        PINK,
        ORANGE,
        RED,
        GREY
    }

    mapping(address => uint256) public rewardPerWallet;

    constructor(address nftTokenTokenAddress) {
        nftToken = ERC721A(nftTokenTokenAddress);
    }

    function distributeReward(uint256 _winnerTeam, uint256 _reward) external {
        require(msg.sender == address(nftToken), 'Only the NFT Contract can call this function');

        uint256 _firstTokenId = _winnerTeam * 1000 + 1;
        uint256 _lastTokenId = _firstTokenId + 1000;

        for (uint256 i = _firstTokenId; i < _lastTokenId;) {
            rewardPerWallet[nftToken.ownerOf(i)] += _reward;
            unchecked { ++i; }
        }
    }

    function claimReward(address _tokenOwner) external nonReentrant {
        require(msg.sender == address(nftToken), 'Only the NFT Contract can call this function');
        require(rewardPerWallet[_tokenOwner] > 0, 'You have no reward to claim');

        uint256 _reward = rewardPerWallet[_tokenOwner];
        payable(_tokenOwner).transfer(_reward);
        
        (bool success, ) = payable(_tokenOwner).call{value: _reward}("");
        require(success, "Claim failed");
        emit ClaimSuccessful(_tokenOwner, _reward);
    }

    function tokenToTeam(uint256 _tokenId) internal pure returns(Team){
        if (_tokenId < 1001) {
            return Team.GREEN;
        } else if (_tokenId < 2001) {
            return Team.PURPLE;
        } else if (_tokenId < 3001) {
            return Team.BLUE;
        } else if (_tokenId < 4001) {
            return Team.YELLOW;
        } else if (_tokenId < 5001) {
            return Team.PINK;
        } else if (_tokenId < 6001) {
            return Team.ORANGE;
        } else if (_tokenId < 7001) {
            return Team.RED;
        }
        return Team.GREY;
    }
}