import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

function NotFoundPage() {
    
    return (
        <div className='page-error'>
            <h1> 404 </h1>
            <h4 className="error_subtitle">Oops Page not found !</h4>
            <Link className="link-back" to="/">Go Back</Link>
        </div>
    );
}


export default NotFoundPage;