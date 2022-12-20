import React from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'

const WhitelistLink = ({swap, ethBalance, tokenBalance, token, account}) => {
    return (
        <div className="container-fluid mt-5">
            <Row className="m-auto swapDiv" >
                <Card>
                    <Card.Body>
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfrEeNPLGnyN4kl9MF9iYMf5Kl-OPsteXE_4THtT3UjTsjO-g/viewform"
                            target="_blank">Click here to access the Google Form</a>
                    </Card.Body>
                </Card>
            </Row>
        </div>
    );
}

export default WhitelistLink;