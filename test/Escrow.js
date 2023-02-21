const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let renter, houseOwner
    let fantombnb, escrow

    beforeEach(async () => {
        // Setup accounts
        [renter, houseOwner] = await ethers.getSigners()

        // Deploy Real Estate
        const FantomBNB = await ethers.getContractFactory('FantomBNB')
        fantombnb = await FantomBNB.deploy()

        // Mint 
        let transaction = await fantombnb.connect(houseOwner).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        // Deploy Escrow
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            fantombnb.address,
            houseOwner.address
        )

        // Approve Property
        transaction = await fantombnb.connect(houseOwner).approve(escrow.address, 1)
        await transaction.wait()

        // Set for Rent Property
        transaction = await escrow.connect(houseOwner).setForRent(1, renter.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(fantombnb.address)
        })

        it('Returns houseOwner', async () => {
            const result = await escrow.houseOwner()
            expect(result).to.be.equal(houseOwner.address)
        })
    })

    describe('Setting for Rent', () => {
        it('Updates as for Rent', async () => {
            const result = await escrow.isForRent(1)
            expect(result).to.be.equal(true)
        })

        it('Returns renter', async () => {
            const result = await escrow.renter(1)
            expect(result).to.be.equal(renter.address)
        })

        it('Returns purchase price', async () => {
            const result = await escrow.rentPrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.rentDeposit(1)
            expect(result).to.be.equal(tokens(5)) // could be a percentage
        })

        it('Updates ownership', async () => {
            expect(await fantombnb.ownerOf(1)).to.be.equal(escrow.address)
        })
    })

    describe('Deposits', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(renter).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Updates contract balance', async () => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(renter).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(houseOwner).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await escrow.approval(1, renter.address)).to.be.equal(true)
            expect(await escrow.approval(1, houseOwner.address)).to.be.equal(true)
        })
    })

    describe('Sale', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(renter).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await escrow.connect(renter).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(houseOwner).approveSale(1)
            await transaction.wait()

            await renter.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(houseOwner).finalizeSale(1)
            await transaction.wait()
        })

        it('Updates ownership', async () => {
            expect(await fantombnb.ownerOf(1)).to.be.equal(renter.address)
        })

        it('Updates balance', async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })
    })
})