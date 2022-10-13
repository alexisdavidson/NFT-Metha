import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Button } from 'react-bootstrap'
import Axios from 'axios'
import configData from "./configData.json";
import vid from "./video/vid.mp4";

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
                <p>Winner: {winner}</p>
            </div>

            <div className="px-5 container">
                <Col className="px-5">
                    <Row className="pt-2">
                        <Button onClick={() => claimReward()} variant="primary">Claim reward</Button>
                    </Row>
                </Col>

            </div>

            
            <div className="px-5 container">
                <video width="750" height="500" controls >
                    <source src={vid} type="video/mp4"/>
                </video>
            </div>
        </div>
    );
}
export default Home