import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg'; //????

const Home = ({ home, provider, account, rentfantombnb, togglePop }) => {
    const [hasDeposited, setHasDeposited] = useState(false)
    const [hasRented, setHasRented] = useState(false)
    const [hasPaidRentPrice, setHasPaidRentPrice] = useState(false)
    const [hasApproved, setHasApproved] = useState(false)
    
    const [potentialRenter, setPotentialRenter] = useState(null)
    const [renter, setRenter] = useState(null)
    const [houseOwner, setHouseOwner] = useState(null)

    const fetchDetails = async () => {

        // -- Potential Renter
        const potentialRenter = await rentfantombnb.potentialRenter(home.id)
        setPotentialRenter(potentialRenter)
        console.log("Potential Renter: ", potentialRenter)

        // -- HouseOwner
        const houseOwner = await rentfantombnb.houseOwner(home.id)
        setHouseOwner(houseOwner)
        console.log("House Owner: ", houseOwner)

        const depositPrice = await rentfantombnb.rentDepositPrice(home.id)
        const rentPrice = await rentfantombnb.rentPrice(home.id)
        const total_paid = await rentfantombnb.getNFTBalance(home.id)
        // console.log("deposit, rent and total paid: ",depositPrice.toString(),rentPrice.toString(),total_paid.toString())
        // console.log("con float: ",parseFloat(depositPrice.toString()) + parseFloat(rentPrice.toString()))
        if(parseFloat(total_paid.toString()) >= (parseFloat(depositPrice.toString()) + parseFloat(rentPrice.toString()))){
            setHasPaidRentPrice(true)
            console.log("Paid rent price:",hasPaidRentPrice)
        }
        
        // -- Renter
        const renter = await rentfantombnb.renter(home.id)
        //setRenter(renter)
        //if(renter=== '0x0000000000000000000000000000000000000000'){
           // console.log("Renter: ",renter)
            
    }

    const fetchRenter = async () => {
        const renter1 = await rentfantombnb.renter(home.id)
        console.log("Current Renter: ",renter1)
        if (await rentfantombnb.renter(home.id) !== null ) return

        const renter = await rentfantombnb.renter(home.id)
        setRenter(renter)
        console.log("House rented by ",renter)
    }

    const sendRentDepositHandler = async () => {
        const depositPrice = await rentfantombnb.rentDepositPrice(home.id)
        const signer = await provider.getSigner()
        console.log("cost of deposit ", home.id, ethers.utils.formatEther(depositPrice.toString()))
        // Renter sends deposit price
        let transaction = await rentfantombnb.connect(signer).sendRentDeposit(home.id, { value: depositPrice })
        await transaction.wait()

        setHasDeposited(true)
    }
    
    const approveRentHandler = async () => {
        const signer = await provider.getSigner()
        console.log("Before approving Is approved: ",hasApproved)
        // HouseOwner approves...
        let transaction = await rentfantombnb.connect(signer).approveRent(home.id)
        await transaction.wait()

        setHasApproved(true)
        console.log("After approving Is approved: ",hasApproved)
    }

    const sendRentPriceHandler = async () => {
        const rentPrice = await rentfantombnb.rentPrice(home.id)
        const signer = await provider.getSigner()
        console.log(ethers.utils.formatEther(rentPrice.toString()))
        // Renter sends Rent price
        let transaction = await rentfantombnb.connect(signer).sendRentPrice(home.id, { value: rentPrice })
        await transaction.wait()

        //setHasPaidRentPrice(true)
        //console.log("Paid rent price: ",hasPaidRentPrice)
    }
    
    const FinalizeRentHandler = async () => {
        const signer = await provider.getSigner()

        // HouseOwner finalize...
        let transaction = await rentfantombnb.connect(signer).finalizeRent(home.id)
        await transaction.wait()

        setHasRented(true)
    }

    const cancelHandler = async () => {
        const signer = await provider.getSigner()
        let transaction = await rentfantombnb.connect(signer).cancelRent(home.id)
        await transaction.wait()
        // Returns deposit to potential renter
    }

    
    useEffect(() => {
        fetchDetails()
        fetchRenter()
    }, [hasRented])

    return (
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[1].value}</strong> bds |
                        <strong>{home.attributes[2].value}</strong> ba |
                        <strong>{home.attributes[3].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.price} FTM</h2>

                    {renter ? (
                        <div className='home__owned'>
                            Rented by {renter.slice(0, 6) + '...' + renter.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {(account === potentialRenter) ? (
                                <button className='home__buy' onClick={sendRentPriceHandler} disable={hasPaidRentPrice}>
                                    Pay 1st Month Rent
                                </button>
                            ) : (account === houseOwner && !hasPaidRentPrice ) ? (
                                console.log("Rent paid: ",hasPaidRentPrice),
                                <><button className='home__buy' onClick={approveRentHandler} disable={hasApproved}>
                                    Approve Renter
                                </button>
                                <button className='home__contact' onClick={cancelHandler} disable>
                                    CANCEL Rent
                                </button></>
                            ) : (account === houseOwner && hasPaidRentPrice ) ? (
                                <><button className='home__buy' onClick={FinalizeRentHandler} disable={hasRented}>
                                    Finalize Rent
                                </button>
                                <button className='home__contact' onClick={cancelHandler} disable>
                                    CANCEL Rent
                                </button></>
                            ) : (
                                <button className='home__buy' onClick={sendRentDepositHandler} disable={hasDeposited}>
                                    Pay Deposit for Rent
                                </button>
                            )}
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Home;