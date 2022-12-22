// Before deploy:
// -Fill whitelist addresses with correct data!
// -Team Wallet mainnet: 
// -Team Wallet rinkeby: 

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Fill with correct data and uncomment the correct network before deploy!
  const teamWallet1 = "0xD71E736a7eF7a9564528D41c5c656c46c18a2AEd"; // goerli
  // const teamWallet1 = ""; // mainnet
  const teamWallet2 = "0xD71E736a7eF7a9564528D41c5c656c46c18a2AEd"; // goerli
  // const teamWallet2 = ""; // mainnet

  const ownerWallet = "0xD71E736a7eF7a9564528D41c5c656c46c18a2AEd" // goerli
  // const ownerWallet = ""; // mainnet
  
  // Fill with correct data and uncomment the correct network before deploy!
  const nftWhitelist = [ownerWallet, "0xD71E736a7eF7a9564528D41c5c656c46c18a2AEd"] // goerli
  // const whitelistAddresses = [teamWallet] // mainnet

  // whitelist root Goerli
  // 0x3bfcd2f1242c6bf205b90abbcd902f423c9e795d1022c56125cfe658d39fdc03
  
  const NFT = await ethers.getContractFactory("NFT");
  const Token = await ethers.getContractFactory("Token");
  const Pool = await ethers.getContractFactory("Pool");
  const Swap = await ethers.getContractFactory("Swap");

  // const nft = await NFT.deploy(ownerWallet, teamWallet1, teamWallet2, nftWhitelist);
  // console.log("NFT contract address", nft.address)
  // const nftPool = await Pool.deploy(nft.address);
  // console.log("Pool contract address", nftPool.address)
  const token = await Token.deploy([ownerWallet], [222_000_000]);
  saveFrontendFiles(token, "Token");
  console.log("Token contract address", token.address)
  
  const swap = await Swap.deploy(token.address);
  saveFrontendFiles(swap, "Swap");
  console.log("Swap contract address", swap.address)

  await token.connect(deployer).transfer(swap.address, toWei(10_000_000))

  // saveFrontendFiles(nft, "NFT");
  // saveFrontendFiles(nftPool, "Pool");

  console.log("Deployment finished")
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
