const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Rent of the House', () => {
    let houseOwner, renter
    let fantombnb, rentfbnb

    beforeEach(async () => {
        // Setup accounts (account0 this one is used by default for contract deployment, account1, account2)
        [contractCreator, houseOwner, renter, anotherAccount ] = await ethers.getSigners()

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

        // it('Initially the Renter is the Rent Contract)', async () => {
        //     const result = await rentfbnb.renter(1)
        //     expect(result).to.be.equal(rentfbnb.address)
        // })

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
            const check = await rentfbnb.potentialRenter(1)
            console.log(check)
        })
    })

    describe('Rent Deposit', () => {
        beforeEach(async () => {
            const transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Shows contract balance equals 5ETH', async () => {
            const result = await rentfbnb.getBalance()
            expect(result).to.be.equal(tokens(5))
        })

        it('House is no longer set for Rent', async () => {
            const result = await rentfbnb.isForRent(1)
            expect(result).to.be.equal(false)
        })

        it('Should not allow for others to rent it', async () => {
            await expect(rentfbnb.connect(anotherAccount).sendRentDeposit(1, { value: tokens(5) })).to.be.reverted;
        })
    })

    describe('Approval', () => {
        beforeEach(async () => {
            transaction = await rentfbnb.connect(houseOwner).approveRent(1)
            await transaction.wait()
        })

        it('Shows House Owner approved the renter', async () => {
            expect(await rentfbnb.approval(1, houseOwner.address)).to.be.equal(true)
        })
    })

    describe('Rent', () => {
        beforeEach(async () => {
            let transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await rentfbnb.connect(houseOwner).approveRent(1)
            await transaction.wait()

            await renter.sendTransaction({ to: rentfbnb.address, value: tokens(5) })

            transaction = await rentfbnb.connect(houseOwner).finalizeRent(1)
            await transaction.wait()
        })

        it('Shows Renter has rented the FantomBNB NFT', async () => {
            expect(await rentfbnb.connect(houseOwner).renter(1)).to.be.equal(renter.address)
        })

        it('Shows contract balance equals 0', async () => {
            expect(await rentfbnb.getBalance()).to.be.equal(0)
        })
    })

    describe('Cancel Rent', () => {
        beforeEach(async () => {
            let transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await rentfbnb.connect(houseOwner).cancelRent(1)
            await transaction.wait()
        })

        it('Shows Potential Renter is 0x0', async () => {
            expect(await rentfbnb.connect(houseOwner).potentialRenter(1)).to.be.equal('0x0000000000000000000000000000000000000000')
        })

        it('Shows contract balance equals 0', async () => {
            expect(await rentfbnb.getBalance()).to.be.equal(0)
        })
    })
})