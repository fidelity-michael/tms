import LoginForm from '../../components/forms/LoginForm/LoginForm';
import "mdbreact/dist/css/mdb.css";
import './style.css';

function LoginPage() {
    
    return (
        <div className='tw-flex tw-items-start tw-justify-center tw-h-screen tw-font-dm container login-container'>
            <div className='row'>
                <div className='col-md-6 tw-bg-dark-sky-blue tw-overflow-auto tw-p-8 tw-shadow-2xl'>
                    <div className='tw-left-2 tw-mt-8 tw-ml-9 tw-mb-2 tw-text-light-pale-blue-white'>
                        <span className='welcome-lbl'>Welcome to </span> <br/>
                        <span className='thesis-lbl'>Thesis Management <br/> System</span>
                    </div>
                </div>
                <div className='col-md-6 tw-overflow-auto tw-pb-16 tw-bg-light-pale-blue-white tw-shadow-2xl'>
                    <h3 className='tw-mt-16 tw-ml-8 tw-font-bold tw-left-2 tw-text-mid-pale-blue tw-text-4xl'>Login</h3>
                    <LoginForm/>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
