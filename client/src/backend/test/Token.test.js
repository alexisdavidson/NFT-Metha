const { expect } = require("chai")
const keccak256 = require("keccak256")
const { MerkleTree } = require("merkletreejs")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("Token", async function() {
    let deployer, addr1, addr2, addr3, nft, token, nftPool, swap
    let ownerWallet = ""
    let teamWallet1 = ""
    let teamWallet2 = ""
    let nftWhitelist = []
    let whitelist = []
    let whitelistRoot = "0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0"

    const getWhitelistProof = (whitelist, acc) => {
        const accHashed = keccak256(acc)
        const leafNodes = whitelist.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
        const hexProof = merkleTree.getHexProof(accHashed);
        return hexProof
    }

    beforeEach(async function() {
        // Get contract factories
        const NFT = await ethers.getContractFactory("NFT");
        const Token = await ethers.getContractFactory("Token");
        const Pool = await ethers.getContractFactory("Pool");
        const Swap = await ethers.getContractFactory("Swap");

        // Get signers
        [deployer, addr1, addr2, addr3] = await ethers.getSigners();
        whitelist = [addr1.address] // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

        // Deploy contracts
        ownerWallet = deployer.address
        teamWallet1 = deployer.address
        teamWallet2 = addr1.address

        nft = await NFT.deploy(ownerWallet, teamWallet1, teamWallet2, nftWhitelist);
        nftPool = await Pool.deploy(nft.address);
        await expect(Token.deploy([nftPool.address], [])).to.be.revertedWith('Minter Addresses and Token Amount arrays need to have the same size.');
        token = await Token.deploy([nftPool.address, ownerWallet], [73000000, 149000000]);

        swap = await Swap.deploy(token.address);
    });

    describe("Deployment", function() {
        it("Should track name and symbol of the token", async function() {
            expect(await token.name()).to.equal("Methereum")
            expect(await token.symbol()).to.equal("ME")
        })
    })

    describe("Swap", function() {
        it("Should swap tokens", async function() {
            await swap.setWhitelistRoot(whitelistRoot)

            let proof1 = getWhitelistProof(whitelist, addr1.address)
            let proof2 = getWhitelistProof(whitelist, addr2.address)
            let proof3 = getWhitelistProof(whitelist, addr3.address)

            const leaf1 = keccak256(addr1.address)
            const leaf2 = keccak256(addr2.address)

            expect(await swap.isValid(proof1, leaf1)).to.equal(true);
            expect(await swap.isValid(proof2, leaf2)).to.equal(false);
            
            await expect(swap.connect(addr3).buyTokens(proof3, {value: 0})).to.be.revertedWith('You are not whitelisted');
            await expect(swap.connect(addr1).buyTokens(proof1, {value: 0})).to.be.revertedWith('Minimum amount to deposit is 0.01');
            
            await token.connect(deployer).transfer(swap.address, toWei(10000000))
            // await deployer.sendTransaction( {to: addr1.address, value: toWei(1)} )
            await swap.connect(addr1).buyTokens(proof1, {value: toWei(0.01)})
        })
    })
})