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
        let transaction = await fantombnb.connect(houseOwner).mint("https://ipfs.io/ipfs/QmaWoVgtT6b7Bv2ZACnFtdbmits2bSMK1Grhh1fhGJSB3Z/1.json")
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
        transaction = await rentfbnb.connect(houseOwner).setForRent(1, tokens(5), tokens(10))
        await transaction.wait()
    })

    describe('Set for Rent', () => {
        it('Returns NFT address', async () => {
            const result = await rentfbnb.nftAddress()
            expect(result).to.be.equal(fantombnb.address)
        })

        it('Returns houseOwner (currently the Rent Contract)', async () => {
            const result = await fantombnb.ownerOf(1)
            expect(result).to.be.equal(rentfbnb.address)
        })

        it('House set for Rent', async () => {
            const result = await rentfbnb.isForRent(1)
            expect(result).to.be.equal(true)
        })

        it('Returns rent deposit amount', async () => {
            const result = await rentfbnb.rentDepositPrice(1)
            expect(result).to.be.equal(tokens(5))
        })

        it('Returns rent price', async () => {
            const result = await rentfbnb.rentPrice(1)
            expect(result).to.be.equal(tokens(10))
        })

    })

    describe('Potential renter sends rent deposit', () => {
        beforeEach(async () => {
            const transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Shows balance for potential renter for this nft equals 5ETH', async () => {
            const result = await rentfbnb.getNFTBalance(1)
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

    describe('Potential renter sends rent price', () => {
        beforeEach(async () => {
            let transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await rentfbnb.connect(renter).sendRentPrice(1, { value: tokens(10) })
            await transaction.wait()
        })

        it('Shows balance for potential renter for this nft equals 15ETH', async () => {
            const result = await rentfbnb.getNFTBalance(1)
            expect(result).to.be.equal(tokens(15))
        })

        it('Only potential renter for this nft can send the rent price', async () => {
            await expect(rentfbnb.connect(anotherAccount).sendRentPrice(1, { value: tokens(10) })).to.be.reverted;
        })
    })

    describe('Rent is finilized by House Owner', () => {
        beforeEach(async () => {
            let transaction = await rentfbnb.connect(renter).sendRentDeposit(1, { value: tokens(5) })  // sending deposit
            await transaction.wait()

            transaction = await rentfbnb.connect(houseOwner).approveRent(1) // approval by house owner
            await transaction.wait()

            transaction = await rentfbnb.connect(renter).sendRentPrice(1, { value: tokens(10) })  // sending rent price
            await transaction.wait()

            transaction = await rentfbnb.connect(houseOwner).finalizeRent(1) // house owner to finalize transaction
            await transaction.wait()
        })

        it('Shows Renter has rented the FantomBNB NFT', async () => {
            expect(await rentfbnb.renter(1)).to.be.equal(renter.address)
        })

        it('Shows balance for potential renter for this nft equals 0ETH', async () => {
            expect(await rentfbnb.getNFTBalance(1)).to.be.equal(0)
        })
    })

    describe('Cancel Rent after Deposit', () => {
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