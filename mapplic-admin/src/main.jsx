import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/mobile/dist/PNotifyMobile.css';
import '@pnotify/core/dist/Material.css';
import { publicServices } from './services/publicServices';
import { store } from './redux/store';
import MapplicAdmin from './MapplicAdmin';
import Dash from './layouts/Dash';

import { MapplicStore } from '../../mapplic/src/MapplicStore';
import '../../mapplic/src/mapplic.css';
const MapplicElement = React.lazy(() => import('../../mapplic/src/MapplicElement'));

const searchParams = new URLSearchParams(window.location.search);

const App = () => {
  const [mapas, setMapas] = useState([]);

  useEffect(() => {
    getMapas();
  }, []);

  function formatToURL(str) {
    let formattedStr = str.toLowerCase();
    formattedStr = formattedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    formattedStr = formattedStr.replace(/\s+/g, "-");
    return formattedStr;
  }

  const getMapas = async () => {
    try {
      const response = await publicServices.getMapas();
      if (response.status === 200) {
        setMapas(response.data);
      }
    } catch (error) {
      // Manejar errores
    }
  };

	const MapaComponent = ({ jsonMap }) => {
	  useEffect(() => {
	    const rootDiv = document.getElementById('root');
	    if (rootDiv) {
	      rootDiv.style.height = 'auto';
	      rootDiv.style.backgroundColor = 'transparent';
	      rootDiv.style.backgroundImage = 'none';
	    }
	  }, []);
	  return (
	    <MapplicStore>
	      <Suspense fallback={<div>Loading...</div>}>
	        <MapplicElement json={jsonMap} />
	      </Suspense>
	    </MapplicStore>
	  );
	};

  return (
    <Provider store={store}>
      <React.StrictMode>
        <Router>
          <Routes>
            <Route path="admin" element={<Dash />}>
              <Route index element={<MapplicAdmin json={searchParams.get('map') || undefined} logo={true} />} />
            </Route>
            {mapas.map((mapa, index) => {
              let url = formatToURL(mapa.name);
              console.log('url===>');
              console.log('lote-' + url);
              console.log('path===>');
              console.log(mapa.path);
              return (
                <Route
                  key={index}
                  path={'lote-' + url}
                  element={<MapaComponent jsonMap={mapa.path} />}
                />
              );
            })}
          </Routes>
        </Router>
      </React.StrictMode>
    </Provider>
  );
};

createRoot(document.getElementById('root')).render(<App />);