import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, rentfantombnb, togglePop }) => {
    const [hasDeposited, setHasDeposited] = useState(false)
    const [hasRented, setHasRented] = useState(false)
//    const [hasInspected, setHasInspected] = useState(false)

    const [potentialRenter, setPotentialRenter] = useState(null)
    const [houseOwner, setHouseOwner] = useState(null)

    const fetchDetails = async () => {
        // -- Potential Renter

        const potentialRenter = await rentfantombnb.potentialRenter(home.id)
        setPotentialRenter(potentialRenter)
//console.log(potentialRenter)

        const hasRented = await rentfantombnb.approval(home.id, potentialRenter)
        setHasRented(hasRented)
        // -- HouseOwner
        
        const houseOwner = await rentfantombnb.houseOwner(home.id)
        setHouseOwner(houseOwner)
//console.log(houseOwner)

    }

    // const fetchOwner = async () => {
    //     if (await rentfantombnb.isListed(home.id)) return

    //     const owner = await rentfantombnb.houseOwner(home.id)
    //     setOwner(owner)
    // }

    const depositHandler = async () => {
        const depositPrice = await rentfantombnb.depositPrice(home.id)
        const signer = await provider.getSigner()

        // Buyer deposit earnest
        let transaction = await rentfantombnb.connect(signer).setDepositPrice(home.id, { value: depositPrice })
        await transaction.wait()

        // Buyer approves...
        transaction = await rentfantombnb.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasDeposited(true)
    }

    const rentHandler = async () => {
        const signer = await provider.getSigner()

        // HouseOwner approves...
        let transaction = await rentfantombnb.connect(signer).approveREnt(home.id)
        await transaction.wait()

        // HouseOwner finalize...
        transaction = await rentfantombnb.connect(signer).finalizeSale(home.id)
        await transaction.wait()

        setHasRented(true)
    }

    useEffect(() => {
        fetchDetails()
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
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.attributes[0].value} ETH</h2>

                    {houseOwner ? (
                        <div className='home__owned'>
                            Owned by {houseOwner.slice(0, 6) + '...' + houseOwner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {(account === potentialRenter) ? (
                                <button className='home__buy' onClick={depositHandler} disabled={hasDeposited}>
                                    Pay Deposit
                                </button>
                            ) : (account === houseOwner) ? (
                                <button className='home__buy' onClick={rentHandler} disabled={hasRented}>
                                    Approve & Rent
                                </button>
                            ) : (
                                <button className='home__buy' onClick={rentHandler} disabled={hasRented}>
                                    Rent
                                </button>
                            )}

                            <button className='home__contact'>
                                Contact agent
                            </button>
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