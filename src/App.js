import React from "react";
import { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { Room, Star } from "@material-ui/icons";
import "./app.css";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from './components/Login'
function App() {
  const storage=window.localStorage
  const [showRegister,setShowRegister]=useState(false)
  const [showLogin,setShowLogin]=useState(false)
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);
  const [newPlace, setnwePlace] = useState(null);
  const [currentUser,setCurrentuser] = useState(null);
  const [currentPlaceId, setCurrentplaceID] = useState(null);
  const [pins, setPins] = useState([]);
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 20.593684,
    longitude: 78.96288,
    zoom: 4,
  });

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pins");
        setPins(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getPins();
  }, []);
  const handlemarkerclick = (id, lat, long) => {
    setCurrentplaceID(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };
  const handleaddclick = (e) => {
    const [longitud, latitud] = e.lngLat;

    setnwePlace({
      lat: latitud,
      long: longitud,
    });
  };
  const handlesubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.long,
    };
    try {
      const res = await axios.post("http://localhost:8000/api/pins", newPin);
      setPins([...pins, res.data]);
      setnwePlace(null);
    } catch (error) {
      console.log(error);
    }
  };
  const handlelogout=()=>{
    storage.removeItem("user")
    setCurrentuser(null)
  }
  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        mapStyle="mapbox://styles/teemuzzz/ckwdgvkph2z0914mp1upvdqwq"
        onDblClick={handleaddclick}
        transitionDuration="200ms"
      >
        {pins.map((pin) => (
          <>
            <Marker 
              latitude={pin.lat}
              longitude={pin.long}
              offsetLeft={-viewport.zoom * 3.5}
              offsetTop={-viewport.zoom * 7}
            >
              <Room
                style={{
                  fontSize: viewport.zoom * 7,
                  color: pin.username === currentUser ? "tomato" : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handlemarkerclick(pin._id, pin.lat, pin.long)}
              />
            </Marker>
            {pin._id === currentPlaceId && (
              <Popup
                latitude={pin.lat}
                longitude={pin.long}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setCurrentplaceID(null)}
                anchor="left"
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{pin.title}</h4>
                  <label>Review</label>
                  <p className="desc">{pin.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(pin.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created By <b>{pin.username}</b>
                  </span>
                  <span className="date">{format(pin.createdAt)}</span>
                </div>
              </Popup>
            )}
          </>
        ))}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            anchor="top"
            onClose={() => setnwePlace(null)}
          >
            <div>
              <form onSubmit={handlesubmit}>
                <label>Title</label>
                <input
                  placeholder="Enter a Title"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Review</label>
                <textarea
                  placeholder="Tell about the place"
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setRating(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button className="submitButton" type="submit">
                  Add Pin
                </button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handlelogout}>Log out</button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={()=>setShowLogin(true)}>LogIn</button>
            <button className="button register" onClick={()=>setShowRegister(true)}>Register</button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister}/>}
        {showLogin && <Login setShowLogin={setShowLogin} storage={storage} setCurrentuser={setCurrentuser}/>}
        
      </ReactMapGL>
    </div>
  );
}

export default App;
