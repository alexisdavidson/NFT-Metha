// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Swap is Ownable, ReentrancyGuard {
    ERC20 private token;

    bytes32 public whitelistRootPrivatePresale;
    bytes32 public whitelistRootPublicPresale;

    uint256 public rate = 100000;
    uint256 public feePercentWithdraw = 40; // 4.0%
    uint256 public feePercentDeposit = 5; // 0.5%
    
    bool public publicSaleEnabled;

    constructor(address _tokenAddress) {
        token = ERC20(_tokenAddress);
    }

    function isValidPrivatePresale(bytes32[] memory _proof, bytes32 _leaf) public view returns (bool) {
        return MerkleProof.verify(_proof, whitelistRootPrivatePresale, _leaf);
    }

    function isValidPublicPresale(bytes32[] memory _proof, bytes32 _leaf) public view returns (bool) {
        return MerkleProof.verify(_proof, whitelistRootPublicPresale, _leaf);
    }

    function buyTokens(bytes32[] memory _proof) public payable nonReentrant {
        require(publicSaleEnabled || isValidPublicPresale(_proof, keccak256(abi.encodePacked(msg.sender)))
             || isValidPrivatePresale(_proof, keccak256(abi.encodePacked(msg.sender))), 'You are not whitelisted');
        require(msg.value >= 10000000000000000, "Minimum amount to deposit is 0.01");
        uint tokenAmount = msg.value * rate * (1000 - feePercentDeposit) / 1000;
        token.transfer(msg.sender, tokenAmount);
    }

    function sellTokens(uint _amount) public nonReentrant {
        uint etherAmount = _amount / rate * (1000 - feePercentWithdraw) / 1000;

        require(token.balanceOf(msg.sender) >= _amount, "User has not enough coins");
        require(address(this).balance >= etherAmount, "House has not enough liquidity");

        payable(msg.sender).transfer(etherAmount);
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function setWhitelistRootPrivatePresale(bytes32 _whitelistRoot) public onlyOwner {
        whitelistRootPrivatePresale = _whitelistRoot;
    }

    function setWhitelistRootPublicPresale(bytes32 _whitelistRoot) public onlyOwner {
        whitelistRootPublicPresale = _whitelistRoot;
    }
    
    function setFeePercentWithdraw(uint256 _fee) public onlyOwner {
        feePercentWithdraw = _fee;
    }
    
    function setFeePercentDeposit(uint256 _fee) public onlyOwner {
        feePercentDeposit = _fee;
    }
    
    function setRate(uint256 _rate) public onlyOwner {
        rate = _rate;
    }

    function setPublicSaleEnabled(bool _state) public onlyOwner {
        publicSaleEnabled = _state;
    }
    
    function withdrawEth() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawToken() public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}