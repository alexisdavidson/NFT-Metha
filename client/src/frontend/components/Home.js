import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Button } from 'react-bootstrap'
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

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
        </main>
    )

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
        </div>
    );
}
export default Home