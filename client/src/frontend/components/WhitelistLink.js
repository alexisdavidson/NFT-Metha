import React from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'

const WhitelistLink = ({swap, ethBalance, tokenBalance, token, account}) => {
    return (
        <div className="container-fluid mt-5">
            <Row className="m-auto swapDiv" >
                <Card>
                    <Card.Body>
                        Link to Google Form Whitelist
                    </Card.Body>
                </Card>
            </Row>
        </div>
    );
}

export default WhitelistLink;