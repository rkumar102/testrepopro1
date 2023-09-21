import "./App.css";
import { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { AuthContext } from "./context/auth-context";
import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import UnavailablePage from "./Pages/UnavailablePage";
import config from "./utils/config.json";
import { useDispatch, useSelector } from "react-redux";
import { sidebarActions } from "./store/sidebar";
import { Spinner } from "react-rainbow-components";

let logoutTimer;
const App = () => {
  const [token, setToken] = useState();
  const [userId, setuserId] = useState();
  const [tokenExp, setTokenExp] = useState();
  const [name, setName] = useState();
  const [department, setDepartment] = useState();
  const [email, setEmail] = useState();
  const [availablity, setAvailablity] = useState(false);
  const [labId, setLabId] = useState();
  const isloading = useSelector((state) => state.isloading.state);
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(config.SERVER.URL + "/api/heartbeat/check")
      .then(async (response) => {
        const data = await response.json();
        //console.log(data);
        if (data && data.status === "available") {
          setAvailablity(true);
        } else {
          setAvailablity(false);
        }
      })
      .catch((error) => {
        //console.log("Error", error);
        setAvailablity(false);
      });
  }, []);
  const login = useCallback(
    (uid, token, name, email, department, labid, expirationDate) => {
      setToken(token);
      setuserId(uid);
      setName(name);
      setDepartment(department);
      setEmail(email);
      setLabId(labid);
      const tokenExpirationDate =
        expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
      setTokenExp(tokenExpirationDate);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          userId: uid,
          token: token,
          name: name,
          department: department,
          email: email,
          labId: labid,
          expiration: tokenExpirationDate.toISOString(),
        })
      );
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setuserId(null);
    setTokenExp(null);
    setName(null);
    setDepartment(null);
    setEmail(null);
    setLabId(null);
    dispatch(sidebarActions.changesidebar(null));
    localStorage.removeItem("userData");
    localStorage.removeItem("logo");
  }, []);

  useEffect(() => {
    if (token && tokenExp) {
      const remainingTime = tokenExp.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExp]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (

      storedData?.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        storedData.name,
        storedData.email,
        storedData.department,
        storedData.labId,
        new Date(storedData.expiration)
      );
    }
  }, [login]);
  let routes;
  if (!availablity) {
    routes = (
      <Switch>
        <Route path="/unavailable" exact component={UnavailablePage}></Route>
        <Redirect to="/unavailable" />
      </Switch>
    );
  } else if (!token && availablity) {
    routes = (
      <Switch>
        <Route path="/" exact component={LoginPage}></Route>
        <Redirect to="/" />
      </Switch>
    );
  } else if (token && availablity) {
    routes = (
      <Switch>
        <Route path="/dashboard" exact component={Dashboard}></Route>
        <Redirect to="/dashboard" />;
      </Switch>
    );
  }

  return (
    <div className="App">
      <AuthContext.Provider
        value={{
          isLoggedIn: !!token,
          token: token,
          userId: userId,
          name: name,
          email: email,
          department: department,
          labId: labId,
          login: login,
          logout: logout,
        }}
      >
        {isloading ? <Spinner size={"medium"} /> : null}
        <Router>{routes}</Router>
      </AuthContext.Provider>
    </div>
  );
};

export default App;
--This is a test comment
--adding another comment the code
--This ia 3rd change
--This is the 4th change
--This is a 5th line change