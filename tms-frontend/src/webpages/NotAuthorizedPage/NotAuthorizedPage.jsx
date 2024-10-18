import { Link } from 'react-router-dom';
import './style.css';

function NotAuthorizedPage() {
    
    return (
        <div className='page-error'>
            <h1> 401 </h1>
            <h4 className="error_subtitle">User Not Authorized !</h4>
            <Link className="link-back" to="/">Please Sign in</Link>
        </div>
    );
}


export default NotAuthorizedPage;
