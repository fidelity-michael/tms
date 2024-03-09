import LoginForm from '../../components/forms/LoginForm/LoginForm';
import "mdbreact/dist/css/mdb.css";
import './style.css';

function LoginPage() {
    
    return (
        <div className='container login-container'>
            <div className='row'>
                <div className='col-md-6 thesis-form'>
                    <div className='thesis-header'>
                        <span className='welcome-lbl'>Welcome to </span> <br/>
                        <span className='thesis-lbl'>Thesis Management <br/> System</span>
                    </div>
                </div>
                <div className='col-md-6 login-form'>
                    <h3>Login</h3>
                    <LoginForm/>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
