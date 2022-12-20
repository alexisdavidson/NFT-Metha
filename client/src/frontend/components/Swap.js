import React from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import BuyForm from './BuyForm'
import SellForm from './SellForm'
import { useState } from 'react'
import { ethers } from 'ethers'
import { useEffect } from 'react'
import whitelistAddresses from './whitelistAddresses';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
window.Buffer = window.Buffer || require("buffer").Buffer; 

const fromWei = (num) => ethers.utils.formatEther(num)

const Swap = ({swap, ethBalance, tokenBalance, token, account}) => {
    const [currentForm, setCurrentForm] = useState('buy')
    const [showingTransactionMessage, setShowingTransactionMessage] = useState(false)
    const [error, setError] = useState(null)
    const [feePercentWithdraw, setFeePercentWithdraw] = useState(1)
    const [feePercentDeposit, setFeePercentDeposit] = useState(1)
    const [rate, setRate] = useState(1)
    const [isWhitelisted, setIsWhitelisted] = useState(false)
    const [proof, setProof] = useState([])

    const getWhitelistProof = (acc) => {
        const accHashed = keccak256(acc)
        const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
        const hexProof = merkleTree.getHexProof(accHashed);
        return hexProof
    }
    const getIsWhitelisted = async(acc, nft) => {
      console.log("getIsWhitelisted")
      
      const isPublicSale = await nft.publicSaleEnabled()
      if (isPublicSale) {
        console.log("public sale is enabled")
        setIsWhitelisted(true)
        return
      }
  
      console.log("whitelistAddresses:")
      console.log(whitelistAddresses)
      
      const accHashed = keccak256(acc)
      const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
      const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
      const hexProof = merkleTree.getHexProof(accHashed);
  
      console.log("hexProof: ")
      console.log(hexProof);
      console.log("keccak256(acc): ")
      console.log(keccak256(acc))
      const isValid = await nft.isValid(hexProof, accHashed);
      console.log("isValid: " + isValid)
  
      setIsWhitelisted(isValid)
      setProof(hexProof)
    }

    const buyTokens = async (etherAmount) => {
        setError(null)

        const proof = getWhitelistProof(account)
        console.log("proof", proof)

        await swap.buyTokens(proof, { value: etherAmount, from: account })
        .catch(error => {
            console.error("Custom error handling: " + error);
            console.error("Custom error handling: " + error?.data?.message);
            setError(error?.data?.message)
        });
      }
    
      const sellTokens = async (tokenAmount) => {
        setError(null)
        await token.approveUnlimited(account);
        await swap.sellTokens(tokenAmount)
        .catch(error => {
            console.error("Custom error handling: " + error?.data?.message);
            setError(error?.data?.message)
        });
      }

    const showTransactionMessage = () => {
        setShowingTransactionMessage(true)
    }

    const loadFees = async () => {
        if (account == null)
            return
        console.log(swap)
        setFeePercentWithdraw((await swap.feePercentWithdraw()).toString())
        setFeePercentDeposit((await swap.feePercentDeposit()).toString())
        setRate(parseInt(await swap.rate()).toString())
    }

    useEffect(() => {
        loadFees()
    }, [])

    let content = <></>
    if (currentForm === 'buy') {
        content = <BuyForm 
                        ethBalance={ethBalance}
                        tokenBalance={tokenBalance}
                        buyTokens={buyTokens}
                        showTransactionMessage={showTransactionMessage}
                        feePercentDeposit={feePercentDeposit}
                        rate={rate}
                    />
    } else if (currentForm === 'sell') {
        content = <SellForm
                        ethBalance={ethBalance}
                        tokenBalance={tokenBalance}
                        sellTokens={sellTokens}
                        showTransactionMessage={showTransactionMessage}
                        feePercentWithdraw={feePercentWithdraw}
                        rate={rate}
                    />
    }

    return (
        <div className="container-fluid mt-5">
            {error ? (
                <div>
                    <p className='mx-3 my-0' style={{color: "red"}}>{error}</p>
                </div>
            ) : (
                showingTransactionMessage && false ? (
                    <div>
                        <p className='mx-3 my-0'>Please follow the instructions on your wallet. The transaction may take few minutes to complete.</p>
                    </div>
                ) : (
                    <Row className="m-auto swapDiv" >
                        {/* <Col className="col-4 mx-auto mb-4">
                            <button 
                                className="btn btn-light"
                                onClick={(event) => { setCurrentForm('buy') }}
                            >
                                Buy
                            </button>
                            <span className="text-muted">&lt; &nbsp; &gt;</span>
                            <button className="btn btn-light"
                                onClick={(event) => { setCurrentForm('sell') }}
                            >
                                Sell
                            </button>
                        </Col> */}
    
                        <Card>
                            <Card.Body>
                                {account ? (
                                    <>
                                        {content}
                                    </>
                                ) : (
                                    <>
                                        Please connect your wallet to access the dApp.
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Row>
                )
            )}
        </div>
    );
}

export default Swap;