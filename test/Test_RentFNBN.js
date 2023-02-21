const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Rent of the House', () => {
    let houseOwner, renter
    let fantombnb, rentfbnb

    beforeEach(async () => {
        // Setup accounts (account0, account1, account2)
        [contractCreator, houseOwner, renter ] = await ethers.getSigners()

        // Deploy Real Estate
        const FantomBNB = await ethers.getContractFactory('FantomBNB')
        fantombnb = await FantomBNB.deploy()

        // Mint 
        let transaction = await fantombnb.connect(houseOwner).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        // Deploy Rent Fantombnb
        const RentFantomBNB = await ethers.getContractFactory('RentFantomBNB')
        rentfbnb = await RentFantomBNB.deploy(
            fantombnb.address,
            houseOwner.address
        )

        // Approve Property
        transaction = await fantombnb.connect(houseOwner).approve(rentfbnb.address, 1)
        await transaction.wait()

        // Set for Rent Property
        transaction = await rentfbnb.connect(houseOwner).setForRent(1, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            const result = await rentfbnb.nftAddress()
            expect(result).to.be.equal(fantombnb.address)
        })
        it('Returns houseOwner (currently the Rent Contract)', async () => {
            const result = await fantombnb.ownerOf(1)
            expect(result).to.be.equal(rentfbnb.address)
        })
    })

    describe('Setting for Rent', () => {
        it('House set for Rent', async () => {
            const result = await rentfbnb.isForRent(1)
            expect(result).to.be.equal(true)
        })

        it('Initially the Renter is the Rent Contract)', async () => {
            const result = await rentfbnb.renter(1)
            expect(result).to.be.equal(rentfbnb.address)
        })

        it('Returns purchase price', async () => {
            const result = await rentfbnb.rentPrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns rent deposit amount', async () => {
            const result = await rentfbnb.rentDepositPrice(1)
            expect(result).to.be.equal(tokens(5)) // could be a percentage or 1 rent month
        })

        it('Updates ownership', async () => {
            expect(await fantombnb.ownerOf(1)).to.be.equal(rentfbnb.address)
        })
    })

    describe('Deposits', () => {
        beforeEach(async () => {
            const transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Updates contract balance', async () => {
            const result = await rentfbnb.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await rentfbnb.connect(renter).approveSale(1)
            await transaction.wait()

            transaction = await rentfbnb.connect(houseOwner).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await rentfbnb.approval(1, renter.address)).to.be.equal(true)
            expect(await rentfbnb.approval(1, houseOwner.address)).to.be.equal(true)
        })
    })

    describe('Sale', () => {
        beforeEach(async () => {
            let transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await rentfbnb.connect(renter).approveSale(1)
            await transaction.wait()

            transaction = await rentfbnb.connect(houseOwner).approveSale(1)
            await transaction.wait()

            await renter.sendTransaction({ to: rentfbnb.address, value: tokens(5) })

            transaction = await rentfbnb.connect(houseOwner).finalizeSale(1)
            await transaction.wait()
        })
// We need to update here, we are not sending NFT to renter, but pausing the NFT
//  and declaring it for Rent fo a rent for x period of timerent time only
        it('Updates ownership', async () => {
            expect(await fantombnb.ownerOf(1)).to.be.equal(renter.address)
        })

        it('Updates balance', async () => {
            expect(await rentfbnb.getBalance()).to.be.equal(0)
        })
    })
})