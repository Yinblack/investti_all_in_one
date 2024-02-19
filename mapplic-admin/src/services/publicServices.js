import { axiosApiInstancePublic, axiosApiInstancePublicData, axiosApiInstanceFormData } from './manageToken'
import { alert, notice, info, success, error, defaultModules, defaults } from '@pnotify/core';
import * as PNotifyMobile from '@pnotify/mobile';
defaultModules.set(PNotifyMobile, {});
defaults.styling = 'material';

// Función para almacenar el token en localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};
// Función para obtener el token desde localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

async function login(values) {
    return axiosApiInstancePublic.post(
        `http://143.110.228.33:3004/login`,
        values
    ).then(response => {
        if (response.status === 201) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    }).catch(function () {
    });
}

async function addMap(name) {
    const dataToSend = {
        name: name,
    };
    return axiosApiInstancePublic.post(
      `http://143.110.228.33:3004/create-map`,
      dataToSend
    ).then(response => {
        return response;
    }).catch(function (error) {
    });
}

async function importMap(values) {
    const dataToSend = {
        title: values.title,
        url: values.url,
    };
    return axiosApiInstancePublic.post(
      `http://143.110.228.33:3004/scrape`,
      dataToSend,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(response => {
        return response;
    }).catch(function (error) {
        // Manejo de errores...
    });
}

async function getMapas(name) {
    return axiosApiInstancePublicData.get(
      `http://143.110.228.33:3004/get-maps`
    ).then(response => {
        return response;
    }).catch(function (error) {
    });
}

async function saveMap_(json) {
    const dataToSend = JSON.stringify(json);
    return axiosApiInstancePublic.post(
      `http://143.110.228.33:3004/map-save`,
      dataToSend
    ).then(response => {
        return response;
    }).catch(function (error) {
    });
}


function uploadCapaImage(object_data){
  return axiosApiInstanceFormData.post(
      `http://143.110.228.33:3004/layer-image`,
      object_data
    )
    .then(response => {
      return response;
    })
    .catch(function (error) {
    });
}

function uploadLocationImage(object_data){
  return axiosApiInstanceFormData.post(
      `http://143.110.228.33:3004/location-image`,
      object_data
    )
    .then(response => {
      return response;
    })
    .catch(function (error) {
    });
}

export const publicServices = {
  login,
  addMap,
  getMapas,
  saveMap_,
  setToken,
  getToken,
  uploadCapaImage,
  uploadLocationImage,
  importMap
};