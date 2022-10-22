import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navigation from './Navbar';
import Home from './Home';

import { useState } from 'react'
import { ethers } from 'ethers'
import { Spinner, Form } from 'react-bootstrap'

import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import TokenAbi from '../contractsData/Token.json'
import TokenAddress from '../contractsData/Token-address.json'
import PoolAbi from '../contractsData/Pool.json'
import PoolAddress from '../contractsData/Pool-address.json'
import vid from "./video/vid.mp4";

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [token, setToken] = useState({})
  const [pool, setPool] = useState({})

  const [pwEntered, setPwEntered] = useState(false)
  const [wrongPw, setWrongPw] = useState(false)

  const updateEnteredPw = event => {
      let pw = event.target.value
      console.log(pw);
      if (pw == "hello123" || pw == "C0rruptio00pt1mi1P3ssim4aa") {
          setPwEntered(true)
      }
  }

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner()

    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    const token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, signer)
    const pool = new ethers.Contract(PoolAddress.address, PoolAbi.abi, signer)

    setNFT(nft)
    setToken(token)
    setPool(pool)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        {pwEntered ? (
          <Navigation web3Handler={web3Handler} account={account} />
          ) : (
            <div className="flex justify-center">
                <div className="m-5 px-5 container">
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Control onChange={updateEnteredPw.bind(this)} placeholder="(TYPE IN PASSWORD)"/>
                        </Form.Group>
                    </Form>
                </div>
            </div>
          )
        }
        
        { false ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Awaiting MetaMask Connection...</p>
          </div>
        ) : (

          
        pwEntered ? (
          <Routes>
            <Route path="/" element={
              <Home account={account} nft={nft} token={token} pool={pool} />
            } />
          </Routes>
          ) : (
            <></>
          )
        ) }
        <div className="px-5 container">
            <video width="750" height="500" controls >
                <source src={vid} type="video/mp4"/>
            </video>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
