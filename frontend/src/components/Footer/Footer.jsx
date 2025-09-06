import React from 'react'
import './footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.logo2} alt="" />
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia exercitationem cupiditate deleniti delectus beatae rerum, voluptates quam, tenetur asperiores quaerat pariatur laborum consectetur, suscipit alias sint. Repudiandae dolorum consequuntur reprehenderit?</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className='footer-content-center'>
                    <h2>COMPANY</h2>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+1-212-456-7890</li>
                        <li>contact@tomato.com</li>
                    </ul>

                </div>


            </div>
            <hr />
            <p className="footer-copyright">
                Copyright 2025 © Tomato.com - All Right Reserved.
            </p>

        </div>
    )
}

export default Footer