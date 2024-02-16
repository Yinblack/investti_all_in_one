import axios from 'axios';
import { alert, notice, info, success, error, defaultModules, defaults } from '@pnotify/core';
import * as PNotifyMobile from '@pnotify/mobile';
defaultModules.set(PNotifyMobile, {});
defaults.styling = 'material';

export const axiosApiInstancePublic = axios.create();
export const axiosApiInstancePublicData = axios.create();
export const axiosApiInstanceFormData = axios.create();

axiosApiInstancePublic.interceptors.response.use(
  response => {
    if (response.status === 200 || response.status === 201) {
      let msg = typeof response.data.hasOwnProperty('message') ? response.data.message : response.data;
      const mySuccess = success({
        text: msg,
        delay: 3000,
        closer: true,
        closerHover: true
      });
    }
    return response;
  },
  error => {
    console.log('error===>');
    console.log(error);
    if (error.response) {
      const status = error.response.status;
      if (status === 409) {
        const errorMessage = error.response.data || 'Conflicto en la solicitud.';
        const myError = notice({
          text: errorMessage
        });
      } else if(status === 401){
        const errorMessage = error.response.data.message || 'Conflicto en la solicitud.';
        const myError = notice({
          text: errorMessage
        });
      } else {
        const myError = error({
          text: `Error del servidor con código de estado ${status}.`
        });
      }
    } else if (error.request) {
      const myError = error({
        text: 'No se recibió una respuesta del servidor. Inténtalo más tarde.'
      });
    } else {
      const myError = error({
        text: 'Error de configuración de la solicitud. Inténtalo más tarde.'
      });      
    }    
    return Promise.reject(error);
  }
);

axiosApiInstancePublicData.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      const status = error.response.status;
      if (status === 409) {
        const errorMessage = error.response.data || 'Conflicto en la solicitud.';
        const myError = notice({
          text: errorMessage
        });
      } else {
        const myError = error({
          text: `Error del servidor con código de estado ${status}.`
        });
      }
    } else if (error.request) {
      const myError = error({
        text: 'No se recibió una respuesta del servidor. Inténtalo más tarde.'
      });
    } else {
      const myError = error({
        text: 'Error de configuración de la solicitud. Inténtalo más tarde.'
      });      
    }    
    return Promise.reject(error);
  }
);


axiosApiInstanceFormData.interceptors.request.use(
  async config => {
    const token_ = localStorage.getItem('token');
    config.headers = { 
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data'
    }
    return config;
  },
  error => {
    console.log('error DDD===>');
    console.log(error);
    return Promise.reject(error);
  }
);

axiosApiInstanceFormData.interceptors.response.use(
  response => {
    if (response.status === 200 || response.status === 201) {
      let msg = response.data.hasOwnProperty('message') ? response.data.message : response.data;
      const mySuccess = success({
        text: msg,
        delay: 3000,
        closer: true,
        closerHover: true
      });
    }
    console.log('response DDD===>');
    console.log(response);
    return response;
  },
  error => {
    console.log('error DDD===>');
    console.log(error);
    if (error.response) {
      const status = error.response.status;
      if (status === 409) {
        const errorMessage = error.response.data || 'Conflicto en la solicitud.';
        const myError = notice({
          text: errorMessage
        });
      } else if(status === 401){
        const errorMessage = error.response.data.message || 'Conflicto en la solicitud.';
        const myError = notice({
          text: errorMessage
        });
      } else {
        const myError = error({
          text: `Error del servidor con código de estado ${status}.`
        });
      }
    } else if (error.request) {
      const myError = error({
        text: 'No se recibió una respuesta del servidor. Inténtalo más tarde.'
      });
    } else {
      const myError = error({
        text: 'Error de configuración de la solicitud. Inténtalo más tarde.'
      });      
    }    
    return Promise.reject(error);
  }
);