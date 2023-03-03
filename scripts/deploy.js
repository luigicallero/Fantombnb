// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup account
  const accounts = await ethers.getSigners()
  const houseOwner = accounts[0]

  // Deploy FantomBNB
  const FantomBNB = await ethers.getContractFactory('FantomBNB')
  const fantombnb = await FantomBNB.deploy()
  await fantombnb.deployed()

  console.log(`Deployed FantomBNB Contract at: ${fantombnb.address}`)
  console.log(`Minting 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    const transaction = await fantombnb.connect(houseOwner).mint(`https://ipfs.io/ipfs/QmaWoVgtT6b7Bv2ZACnFtdbmits2bSMK1Grhh1fhGJSB3Z/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Rent Contract
  const RentFantomBNB = await ethers.getContractFactory('RentFantomBNB')
  const rentfantombnb = await RentFantomBNB.deploy(
    fantombnb.address,
    houseOwner.address,
  )
  await rentfantombnb.deployed()

  console.log(`Deployed Rent Contract at: ${rentfantombnb.address}`)
  console.log(`Setting for Rent 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    // Approve properties...
    let transaction = await fantombnb.connect(houseOwner).approve(rentfantombnb.address, i + 1)
    await transaction.wait()
  }

  // Setting properties for Rent...
  transaction = await rentfantombnb.connect(houseOwner).setForRent(1, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await rentfantombnb.connect(houseOwner).setForRent(2, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await rentfantombnb.connect(houseOwner).setForRent(3, tokens(10), tokens(5))
  await transaction.wait()

  transaction = await rentfantombnb.connect(houseOwner).setForRent(4, tokens(6), tokens(12))
  await transaction.wait()

  transaction = await rentfantombnb.connect(houseOwner).setForRent(5, tokens(30), tokens(50))
  await transaction.wait()

  transaction = await rentfantombnb.connect(houseOwner).setForRent(6, tokens(3), tokens(8))
  await transaction.wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
