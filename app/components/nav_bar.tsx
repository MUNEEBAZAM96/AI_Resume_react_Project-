import React from 'react';
import { Link } from 'react-router';

const Navbar = () => {
    return (
        <div className='navbar flex items-center '>
            <Link to="/" >
                <p className='text-2xl font-bold text-gradient '>
                    Resume AI
                </p>
            </Link>
    
            <div className='nav-links flex items-center gap-8 text-sm font-medium'>
                <Link className='hover:text-sky-400 transition-colors' to="/"> Home </Link>
                <Link className='hover:text-sky-400 transition-colors' to="/"> About </Link>
                <Link className='hover:text-sky-400 transition-colors' to="/"> Contact </Link>
                
            </div>
    
            <Link to="/upload">
                <button className='primary-button w-fit px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-sm font-semibold text-white shadow-sm transition-colors'>
                    Upload Resume
                </button>
            </Link>
        </div>
    )
    }
 
export default Navbar;


