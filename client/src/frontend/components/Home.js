import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Button, Form } from 'react-bootstrap'
import Axios from 'axios'
import configData from "./configData.json";

const Home = ({ account, nft, token, pool }) => {
    const [loading, setLoading] = useState(true)

    const [winner, setWinner] = useState(-1)

    const loadWinner = async () => {
        
        Axios.get(configData.SERVER_URL + 'api/get_current_winner', {}).then((response) => {
            const winnerResult = response.data.winner
            console.log("Winner is " + winnerResult)
            setWinner(winnerResult)
            setLoading(false)
        })

    }

    const claimReward = async () => {
        console.log("Claim Reward");
        // await nft.setApprovalForAll(pool.address, true);
        // console.log("Staking " + stakeId + " nft...")
        // await(await pool.stake(stakeId)).wait()
        // window.location.reload();
    }
    
    useEffect(() => {
        loadWinner()
    }, [])

    return (
        <div className="flex justify-center">
            <div className="px-5 container">
                {/* <p>Winner: {winner}</p> */}
                dApp
            </div>
        </div>
    );
}
export default Home