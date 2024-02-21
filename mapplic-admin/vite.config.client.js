import commonConfig from './vite.config.common';

export default {
  ...commonConfig,
  define: {
    'import.meta.env.REACT_APP_API_CALLS': JSON.stringify(process.env.REACT_APP_API_CALLS)
  }
};