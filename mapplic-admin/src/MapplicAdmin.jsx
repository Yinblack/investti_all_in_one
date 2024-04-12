import React, { Suspense, useState, useEffect } from 'react'
import { ControlPanel } from './ControlPanel'
import { AdminBar } from './AdminBar'
import { MapplicStore } from '../../mapplic/src/MapplicStore'
import '../../mapplic/src/mapplic.css'
import './mapplic-admin.scss'
import './custom.scss'
import { UploadFieldContextProvider } from './UploadFieldContext'

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { Button, LinearProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import { setLocale } from 'yup';


import { publicServices } from './services/publicServices';

const MapplicElement = React.lazy(() => import('../../mapplic/src/MapplicElement'));

const MapplicAdmin = ({json = null, action, saveMap, title, uploadField, state}) => {

  	setLocale({
  	  mixed: {
  	    required: 'Este campos es requerido.'
  	  }
  	})
	const [isLogged, setIsLogged] = useState(false);
	const [modalLogin, setModalLogin] = useState(false);
  	const handleCloseModalLogin = () => {
  	  setModalLogin(false);
  	};
  	function checkSession(){
  		if (localStorage.getItem('token')) {
  			setModalLogin(false);
  			setIsLogged(true);
  		}else{
  			setModalLogin(true);
  			setIsLogged(false);
  		}
  	}
	useEffect(() => {
		checkSession();
	}, []);

	return (
		<MapplicStore>
			{isLogged ?
				<UploadFieldContextProvider value={uploadField}>
					<AdminBuilder json={json} action={action} saveMap={saveMap} title={title} state={state} />
				</UploadFieldContextProvider>
			:''}
      		<Dialog open={modalLogin}>
      		  <DialogTitle>Inicia sesión</DialogTitle>
      		  <DialogContent>
    			<Formik
    			  	initialValues={{
    			  	  username: 'usuario1',
    			  	  password: 'Kimono#1990',
    			  	}}
          			validationSchema={Yup.object().shape({
          			  username: Yup.string().required(),
          			  password: Yup.string().required(),
          			})}
    			  	onSubmit={(values, { setSubmitting }) => {
            			publicServices.login(values)
            			  .then(response => {
        					if (response.status===200) {
        						setSubmitting(false);
        						localStorage.setItem('token', response.data);
            					setTimeout(() => {
            					  window.location.reload();
            					}, 500);
        					}
            			  })
            			  .catch(function (error) {
            			  }).then(function () {
            			    setSubmitting(false);
            			  });
    			  	}}
    			>
    			  {({ submitForm, isSubmitting }) => (
    			    <Form>
    			      <Field
    			        component={TextField}
    			        type="text"
    			        label="Usuario"
    			        name="username"
    			        style={{ marginBottom: '20px', marginTop: '20px', display: 'block' }}
    			      />
     			      <Field
    			        component={TextField}
    			        type="password"
    			        label="Contraseña"
    			        name="password"
    			        style={{ marginBottom: '20px', marginTop: '20px', display: 'block' }}
    			      />
    			      {isSubmitting && <LinearProgress />}
    			      <br />
    			      <Button
    			        variant="contained"
    			        color="primary"
    			        disabled={isSubmitting}
    			        onClick={submitForm}
    			      >
    			        Entrar
    			      </Button>
    			    </Form>
    			  )}
    			</Formik>
      		  </DialogContent>
      		</Dialog>
		</MapplicStore>
	)
}

const AdminBuilder = ({json, action, saveMap, title, state = 1}) => {
	const [jsonR, setJsonR] = useState(json);
	const [view, setView] = useState('desktop');
	const [history, setHistory] = useState(0);

	const updateHistory = (step = true) => setHistory((prev) => step ? Math.abs(prev) + 1 : -Math.abs(prev) - 1);
	return (
		<div className="mapplic-admin">
			<ControlPanel updateHistory={updateHistory} action={action} title={title} state={state} saveMap={saveMap} setJsonR={setJsonR} />
			<div className="mapplic-admin-main">
				<AdminBar history={history} view={view} setView={setView} saveMap={saveMap} />
				<div className="mapplic-admin-content">
					<div id="map-container" className={view}>
						<Suspense fallback={<div>Loading...</div>}>
							<MapplicElement json={jsonR} />
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MapplicAdmin