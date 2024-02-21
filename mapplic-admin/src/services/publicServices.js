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
        `${import.meta.env.REACT_APP_API_CALLS}login`,
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
      `${import.meta.env.REACT_APP_API_CALLS}create-map`,
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
        type: values.type,
        action: values.action
    };
    return axiosApiInstancePublic.post(
      `${import.meta.env.REACT_APP_API_CALLS}scrape`,
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
      `${import.meta.env.REACT_APP_API_CALLS}get-maps`
    ).then(response => {
        return response;
    }).catch(function (error) {
    });
}

async function saveMap_(json) {
    const dataToSend = JSON.stringify(json);
    return axiosApiInstancePublic.post(
      `${import.meta.env.REACT_APP_API_CALLS}map-save`,
      dataToSend
    ).then(response => {
        return response;
    }).catch(function (error) {
    });
}


function uploadCapaImage(object_data){
  return axiosApiInstanceFormData.post(
      `${import.meta.env.REACT_APP_API_CALLS}layer-image`,
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
      `${import.meta.env.REACT_APP_API_CALLS}location-image`,
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