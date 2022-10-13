const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => Math.round(ethers.utils.formatEther(num))

describe("NFTPool", async function() {
    let deployer, addr1, addr2, nft, token, nftPool, rewardRate
    let teamWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    let whitelist = []

    const poolTokenAmount = 73000000
    const teamTokenAmount = 149000000
        
    let secondsInDay = 86400
    rewardRate = Math.floor(toWei(5) / secondsInDay).toString()
    console.log("Reward rate is " + rewardRate.toString() + " per second")

    beforeEach(async function() {
        // Get contract factories
        const NFT = await ethers.getContractFactory("NFT");
        const Token = await ethers.getContractFactory("Token");
        const NFTPool = await ethers.getContractFactory("NFTPool");

        // Get signers
        [deployer, addr1, addr2] = await ethers.getSigners();
        whitelist = [addr1.address, addr2.address]

        // Deploy contracts
        nft = await NFT.deploy(teamWallet, whitelist);
        nftPool = await NFTPool.deploy(nft.address);
        token = await Token.deploy([nftPool.address, teamWallet], [poolTokenAmount, teamTokenAmount]);
        await nftPool.setOwnerAndTokenAddress(teamWallet, token.address);
    });

    describe("Deployment", function() {
        it("Should mint tokens for pool contract and team", async function() {
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount);
            expect(fromWei(await token.balanceOf(teamWallet))).to.equals(teamTokenAmount);
            expect(fromWei(await token.totalSupply())).to.equals(poolTokenAmount + teamTokenAmount);
            
            expect((await nftPool.rewardRate()).toString()).to.equal(rewardRate);
        })
    })

    describe("Staking and unstaking", function() {
        it("Should track staking wallets and distribute rewards on unstaking", async function() {
            await nft.connect(addr1).mint(1);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);
            
            // Stake
            await nft.connect(addr1).setApprovalForAll(nftPool.address, true);

            await expect(nftPool.connect(addr1).stake(333)).to.be.revertedWith('There is no ongoing mission!');

            await nftPool.startMission(24 * 15); // 15 Days mission
            await nftPool.connect(addr1).stake(333);
            
            expect((await nftPool.getStakedTokens(addr1.address))[0]).to.equals(333);

            expect((await nft.ownerOf(333))).to.equals(nftPool.address);
            expect((await token.balanceOf(addr1.address))).to.equals(0);
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount);

            // Unstake after 10 days
            const tenDays = 10 * 24 * 60 * 60 + 10;
            await helpers.time.increase(tenDays);

            await nftPool.connect(addr1).unstake(333);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);

            // Expecting 50 units as reward
            console.log("Expected Reward: " + fromWei((rewardRate * tenDays).toString()))
            console.log("Pool actual new balance: " + fromWei(await token.balanceOf(addr1.address)))

            expect(fromWei(await token.balanceOf(addr1.address))).to.equals(fromWei((rewardRate * tenDays).toString()));
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount - fromWei((rewardRate * tenDays).toString()));
        })

        it("Should claim 10 days rewards for a 10 days mission and 20 days staking", async function() {
            await nft.connect(addr1).mint(1);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);
            
            // Stake
            await nft.connect(addr1).setApprovalForAll(nftPool.address, true);

            await expect(nftPool.connect(addr1).stake(333)).to.be.revertedWith('There is no ongoing mission!');

            const missionTime = 24 * 10; // 10 Days mission
            await nftPool.startMission(missionTime); 
            await nftPool.connect(addr1).stake(333);
            
            expect((await nftPool.getStakedTokens(addr1.address))[0]).to.equals(333);

            expect((await nft.ownerOf(333))).to.equals(nftPool.address);
            expect((await token.balanceOf(addr1.address))).to.equals(0);
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount);

            // Unstake after 20 days
            const twentyDays = 20 * 24 * 60 * 60 + 10;
            await helpers.time.increase(twentyDays);

            await nftPool.connect(addr1).unstake(333);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);

            // Expecting 50 units as reward
            console.log("Expected Reward: " + fromWei((rewardRate * missionTime * 3600).toString()))
            console.log("Pool actual new balance: " + fromWei(await token.balanceOf(addr1.address)))

            expect(fromWei(await token.balanceOf(addr1.address))).to.equals(fromWei((rewardRate * missionTime * 3600).toString()));
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount - fromWei((rewardRate * missionTime * 3600).toString()));
        })

        it("Should not win more reward if a new mission starts before unstake was done", async function() {
            await nft.connect(addr1).mint(1);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);
            
            // Stake
            await nft.connect(addr1).setApprovalForAll(nftPool.address, true);

            await expect(nftPool.connect(addr1).stake(333)).to.be.revertedWith('There is no ongoing mission!');

            const missionTime = 24 * 10; // 10 Days mission
            await nftPool.startMission(missionTime); 
            await nftPool.connect(addr1).stake(333);
            
            expect((await nftPool.getStakedTokens(addr1.address))[0]).to.equals(333);

            expect((await nft.ownerOf(333))).to.equals(nftPool.address);
            expect((await token.balanceOf(addr1.address))).to.equals(0);
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount);

            const tenDays = 10 * 24 * 60 * 60 + 10;
            await helpers.time.increase(tenDays);

            await nftPool.startMission(missionTime); 

            await helpers.time.increase(tenDays);

            await nftPool.connect(addr1).unstake(333);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);

            // Expecting 50 units as reward
            console.log("Expected Reward: " + fromWei((rewardRate * missionTime * 3600).toString()))
            console.log("Pool actual new balance: " + fromWei(await token.balanceOf(addr1.address)))

            expect(fromWei(await token.balanceOf(addr1.address))).to.equals(fromWei((rewardRate * missionTime * 3600).toString()));
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount - fromWei((rewardRate * missionTime * 3600).toString()));
        })

        it("Slightly more complex scenario: Unstake too late and join a mission in the middle", async function() {
            await nft.connect(addr1).mint(1);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);
            
            // Stake
            await nft.connect(addr1).setApprovalForAll(nftPool.address, true);

            await expect(nftPool.connect(addr1).stake(333)).to.be.revertedWith('There is no ongoing mission!');

            const missionTime = 24 * 10; // 10 Days mission
            await nftPool.startMission(missionTime); 
            await nftPool.connect(addr1).stake(333);
            
            expect((await nftPool.getStakedTokens(addr1.address))[0]).to.equals(333);

            expect((await nft.ownerOf(333))).to.equals(nftPool.address);
            expect((await token.balanceOf(addr1.address))).to.equals(0);
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount);

            const tenDays = 10 * 24 * 60 * 60 + 10;
            await helpers.time.increase(tenDays);

            await nftPool.startMission(missionTime); 

            const fiveDays = 5 * 24 * 60 * 60 + 10;
            await helpers.time.increase(fiveDays);
            
            await nftPool.connect(addr1).unstake(333);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);

            // Expecting 50 units as reward
            console.log("Expected Reward: " + fromWei((rewardRate * missionTime * 3600).toString()))
            console.log("Pool actual new balance: " + fromWei(await token.balanceOf(addr1.address)))

            expect(fromWei(await token.balanceOf(addr1.address))).to.equals(fromWei((rewardRate * missionTime * 3600).toString()));
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount - fromWei((rewardRate * missionTime * 3600).toString()));

            // Now restake
            await nftPool.connect(addr1).stake(333);

            await helpers.time.increase(tenDays);
            
            await nftPool.connect(addr1).unstake(333);
            expect((await nft.ownerOf(333))).to.equals(addr1.address);

            // Expecting 25 units as reward
            console.log("Expected Reward: " + fromWei((rewardRate * fiveDays).toString()))
            console.log("Pool actual new balance: " + fromWei(await token.balanceOf(addr1.address)))

            expect(fromWei(await token.balanceOf(addr1.address))).to.equals(fromWei((rewardRate * (missionTime * 3600 + fiveDays)).toString()));
            expect(fromWei(await token.balanceOf(nftPool.address))).to.equals(poolTokenAmount - fromWei((rewardRate * (missionTime * 3600 + fiveDays)).toString()));
        })
    })
})
