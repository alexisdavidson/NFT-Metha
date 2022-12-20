import {
    Link
} from "react-router-dom";

import { Image, Navbar, Nav, Button, Container } from 'react-bootstrap'
import media from '../img/eth-logo.png'
import icon_tg from '../img/icon_tg.png'
import icon_tw from '../img/icon_tw.png'

const Navigation = ({ setMenu, web3Handler, account, pwEntered }) => {
    return (
        <Navbar expand="lg" bg="light" variant="light">
            <Container>
                <Navbar.Brand>
                    <div onClick={() => setMenu(0)} className="navbarElemntLink">
                        <img src={media} width="40" height="40" className="" alt="" />
                    &nbsp; Metha
                    </div>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto">
                        <div onClick={() => setMenu(1)} className="navbarElemntLink py-0 pe-4">
                            Swap dApp
                        </div>
                        <a href="https://google.com/" target="_blank" className="py-0 pe-2">
                            <Image src={icon_tg} width="30" height="30" className="p-0"/>
                        </a>
                        <a href="https://twitter.com/" target="_blank" className="py-0 pe-4">
                            <Image src={icon_tw} width="30" height="30" className="p-0"/>
                        </a>
                    </Nav>
                    {pwEntered ? (
                        <Nav>
                            {account ? (
                                <Nav.Link
                                    href={`https://etherscan.io/address/${account}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="button nav-button btn-sm mx-4">
                                    <Button variant="outline-dark">
                                        {account.slice(0, 5) + '...' + account.slice(38, 42)}
                                    </Button>

                                </Nav.Link>
                            ) : (
                                <Button onClick={web3Handler} variant="outline-dark">Connect Wallet</Button>
                            )}
                        </Nav>
                    ) : (
                        <></>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;