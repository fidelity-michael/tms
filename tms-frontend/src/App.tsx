import { BrowserRouter as Router, 
  Route, 
  Routes,
} from "react-router-dom";

import LoginPage from "./webpages/LoginPage/LoginPage"
import StudentPage from "./webpages/StudentPage/StudentPage";
import ProfessorPage from "./webpages/ProfessorPage/ProfessorPage";
import SecretariatPage from "./webpages/SecretariatPage/SecretariatPage";
import AdministatorPage from "./webpages/AdministratorPage/AdministratorPage";
import NotFoundPage from "./webpages/NotFoundPage/NotFoundPage";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "./App.css";


function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/student" element={<StudentPage />} />
            <Route path="/professor" element={<ProfessorPage />} />
            <Route path="/secretariat" element={<SecretariatPage />} />
            <Route path="/administrator" element={<AdministatorPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
