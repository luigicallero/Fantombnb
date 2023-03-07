import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import FantomBNB from './abis/FantomBNB.json'
import RentFantomBNB from './abis/RentFantomBNB.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [rentfantombnb, setRentContract] = useState(null)

  const [account, setAccount] = useState(null)

  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()
    const fantombnb = new ethers.Contract(config[network.chainId].fantombnb.address, FantomBNB, provider)
    const totalSupply = await fantombnb.totalSupply()
    const homes = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await fantombnb.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }

    // Captured Home prices from Rent Contract
    const rentfantombnb = new ethers.Contract(config[network.chainId].rentfantombnb.address, RentFantomBNB, provider)
    setRentContract(rentfantombnb)
    
    for (let index = 0; index < homes.length; index++) {
      const rentPrice = await rentfantombnb.rentPrice(index + 1)
      homes[index].price = ethers.utils.formatEther(rentPrice.toString())
    }
    
    setHomes(homes)
    console.log(homes)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }
  
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      
      <div id="container">
        <Search />
        <div className='cards__section'>
          <h3>Homes For You</h3>
          <hr />
          <div className='cards'>
            {homes.map((home, index) => (
              <div className='card' key={index} onClick={() => togglePop(home)} value={home.address}>
                <div className='card__image'>
                  <img src={home.image} alt="Home" />
                </div>
                <div className='card__info'>
                  <h4>{home.price} FTM</h4>
                  <p>
                    <strong>{home.attributes[1].value}</strong> bds |
                    <strong>{home.attributes[2].value}</strong> ba |
                    <strong>{home.attributes[3].value}</strong> sqft
                  </p>
                  <p>{home.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} rentfantombnb={rentfantombnb} togglePop={togglePop} />
      )}
      
    </div>
  );
}

export default App;
