import { toastr } from 'react-redux-toastr';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'

export const showToastr = (
  type_,
  title_,
  message_,
  timeOut_,
  showCloseButton_,
  progressBar_,
  position_
) => {
  const options = {
    timeOut: parseInt(timeOut_),
    showCloseButton: showCloseButton_,
    progressBar: progressBar_,
    position: position_
  };
  const toastrInstance =
    type_ === 'info' ? toastr.info :
      type_ === 'warning' ? toastr.warning :
        type_ === 'error' ? toastr.error : toastr.success;
  toastrInstance(
    title_,
    message_ || '',
    options
  );
}

//position: top-left top-center top-right bottom-left bottom-center and bottom-right

export const toastrError = (error) => {
  let data = null;
  if (error.response.hasOwnProperty('data')){
    data = error.response.data;
  }
  let status_code = error.response.status;
  if (status_code === 401) {
    if (data.hasOwnProperty('msg')) {
      showerror(error.response.data.msg);
      return false;
    }else{
      window.location.href='/auth';
    }
  }else if (status_code === 422) {
    if (data.hasOwnProperty('errors') && typeof(data.errors)==='object') {
      for (let error in data.errors) {
        showerror(`${data.errors[error]}`);
      }
    }
  }else{
    showerror('Ha ocurrido un error, intentalo mas tarde.');
  }
}

function showerror(msg){
  toastr.error(
    '',
    msg,
    {
      timeOut: parseInt(2500),
      showCloseButton: true,
      progressBar: true,
      position: 'top-left'
    }
  );
}