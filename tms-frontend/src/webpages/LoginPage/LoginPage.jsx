import LoginForm from "../../components/forms/LoginForm/LoginForm";
import "mdbreact/dist/css/mdb.css";
import "./style.css";

function LoginPage() {
  return (
    <div className="container login-container">
      <div className="row">
        <div className="col-md-6 thesis-form lg:tw-pr-16">
          <div className="tw-flex tw-justify-center lg:tw-mt-8">
            <img
              className="tw-object-scale-down tw-h-32 tw-w-78"
              src="/logo.svg"
              alt="logo"
            />
          </div>
          <div className="thesis-header">
            <span className="welcome-lbl">Welcome to the</span> <br />
            <span className="thesis-lbl">
              Thesis Management <br /> System
            </span>
          </div>
        </div>
        <div className="col-md-6 login-form">
          <h3>Login</h3>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
