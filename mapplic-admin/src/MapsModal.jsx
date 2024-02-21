import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { X, Plus } from 'react-feather'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import builtin from './builtInMaps.json'

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { Button, LinearProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import TextFieldMaterial from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import * as Yup from 'yup';
import { setLocale } from 'yup';

import { publicServices } from './services/publicServices';

export const MapsModal = ({open, setOpen, data}) => {

	const types = [
	    { value: 'hidden', label: 'Oculto' },
	    { value: 'circle', label: 'Círculo' },
	    { value: 'dot', label: 'Punto' },
	    { value: 'square', label: 'Cuadrado' },
	    { value: 'rounded', label: 'Redondeado' },
	    { value: 'pin1', label: 'Pin 1' },
	    { value: 'pin2', label: 'Pin 2' },
	    { value: 'thumb', label: 'Miniatura' },
	    { value: 'text', label: 'Texto' },
	];

	const actions = [
	    { value: 'tooltip', label: 'Tooltip' },
	    { value: 'none', label: 'Hacer nada' },
	    { value: 'sidebar', label: 'PopUp lateral' },
	    { value: 'link', label: 'Abrir enlace' }
	];

	const [preset, setPreset] = useState('world');
	const [mapas, setMapas] = useState([]);
	const [openModalNew, setOpenModalNew] = useState(false);
  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleCloseModalNew = () => {
    setOpenModalNew(false);
  };
  setLocale({
    mixed: {
      required: 'Este campos es requerido.'
    }
  })

	const [openModalImport, setOpenModalImport] = useState(false);
  const handleCloseModalImport = () => {
    setOpenModalImport(false);
  };


	useEffect(() => {
		getMapas();
		if (Object.keys(data).length === 0) {
			setOpen(true);
		}else{
			setOpen(false);
		}
	}, [data]);


	const getMapas = async () => {
        publicServices.getMapas()
        	.then(response => {
     			if (response.status===200) {
     				setMapas(response.data);
     			}
        	})
        	.catch(function (error) {
        	})
        	.then(function () {
        	});
	}


	const MapList = ({ mapas }) => {
	  return (
	    <React.Fragment>
	      {mapas.length > 0 ? (
	        mapas.map((mapa, index) => (
	          <DemoMap key={index} title={mapa.name} url={mapa.path} />
	        ))
	      ) : (
	        <p>No hay mapas disponibles.</p>
	      )}
	    </React.Fragment>
	  );
	};

	return (
		<React.Fragment>
			<Modal classNames={{modal: 'mapplic-admin-ui'}} open={open} onClose={() => setOpen(false)} closeIcon={<X size={16}/>} center>
				<div>
					<h3>Mapas</h3>
					<small>selecciona ó crea un mapa.</small>
				</div>
				<div className="mapplic-demos">
					<MapList mapas={mapas} />
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
					<button className="mapplic-button" onClick={() => setOpenModalNew(true)}>Nuevo mapa</button>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
					<button className="mapplic-button" onClick={() => setOpenModalImport(true)}>Importar de URL</button>
				</div>
			</Modal>
      		<Dialog open={openModalNew} onClose={handleCloseModalNew}>
      		  <DialogTitle>Nuevo mapa</DialogTitle>
      		  <DialogContent>
    			<Formik
    			  	initialValues={{
    			  	  title: ''
    			  	}}
          			validationSchema={Yup.object().shape({
          			  title: Yup.string().required()
          			})}
    			  	onSubmit={(values, { setSubmitting }) => {
            			publicServices.addMap(values.title)
            			  .then(response => {
        					if (response.status===200) {
        						setSubmitting(false);
        						handleCloseModalNew();
        						getMapas();
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
    			        label="Título"
    			        name="title"
    			        style={{ marginBottom: '20px', marginTop: '20px' }}
    			      />
    			      <br />
    			      {isSubmitting && <LinearProgress />}
    			      <br />
    			      <Button
    			        variant="contained"
    			        color="primary"
    			        disabled={isSubmitting}
    			        onClick={submitForm}
    			      >
    			        Agregar
    			      </Button>
    			    </Form>
    			  )}
    			</Formik>

      		  </DialogContent>
      		  <DialogActions>
      		    <Button onClick={handleCloseModalNew}>Cancelar</Button>
      		  </DialogActions>
      		</Dialog>

      		<Dialog open={openModalImport} onClose={handleCloseModalImport}>
      		  <DialogTitle>Importar mapa</DialogTitle>
      		  <DialogContent>
    			<Formik
    			  	initialValues={{
    			  	  title: '',
    			  	  url: '',
    			  	  type: '',
    			  	  action: ''
    			  	}}
          			validationSchema={Yup.object().shape({
          			  title: Yup.string().required(),
          			  url: Yup.string().required(),
          			  type: Yup.string().required(),
          			  action: Yup.string().required()
          			})}
    			  	onSubmit={(values, { setSubmitting }) => {
            			publicServices.importMap(values)
            			  .then(response => {
        					if (response.status===200) {
        						setSubmitting(false);
        						handleCloseModalImport();
        						getMapas();
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
    			        label="Título"
    			        name="title"
    			        style={{ marginBottom: '20px', marginTop: '20px' }}
    			      />
    			      <br />
    			      <Field
    			        component={TextField}
    			        type="text"
    			        label="URL"
    			        name="url"
    			        style={{ marginBottom: '20px', marginTop: '20px' }}
    			      />
    			      <br />
        				<TextFieldMaterial
        				  id="type"
        				  name="type"
        				  select
        				  fullWidth 
        				  label="Icono"
        				  defaultValue="circle"
        				  helperText="Icono para el punto en el mapa"
        				>
        				  {types.map((option) => (
        				    <MenuItem key={option.value} value={option.value}>
        				      {option.label}
        				    </MenuItem>
        				  ))}
        				</TextFieldMaterial>
    			      <br />
        				<TextFieldMaterial
        				  id="action"
        				  name="action"
        				  select
        				  fullWidth 
        				  label="Acción al clic"
        				  defaultValue="tooltip"
        				  helperText="Acción al hacer clic en un punto"
        				>
        				  {actions.map((option) => (
        				    <MenuItem key={option.value} value={option.value}>
        				      {option.label}
        				    </MenuItem>
        				  ))}
        				</TextFieldMaterial>
    			      <br />
    			      {isSubmitting && <LinearProgress />}
    			      <br />
    			      <Button
    			        variant="contained"
    			        color="primary"
    			        disabled={isSubmitting}
    			        onClick={submitForm}
    			      >
    			        Importar
    			      </Button>
    			    </Form>
    			  )}
    			</Formik>

      		  </DialogContent>
      		  <DialogActions>
      		    <Button onClick={handleCloseModalImport}>Cancelar</Button>
      		  </DialogActions>
      		</Dialog>

		</React.Fragment>
	)
}

const MapLink = ({id, map, file}) => {
	const [exists, setExists] = useState(false);
	
	useEffect(() => {
		const checkIfFileExists = async (url) => {
			try {
				const res = await fetch(url, { method: 'HEAD' });
				if (res.status === 200) return true;
				else return false;
			} catch (error) {
				return null; // error occurred, file does not exist
			}
		}
		
		const updateExistsState = async () => {
			const result = await checkIfFileExists(file);
			setExists(result);
		}
	  
		updateExistsState();
	}, [file]);

	const getData = (id, map, json) => {	
		return {
			target: json,
			settings: {
				mapWidth: map.width,
				mapHeight: map.height,
				height: '600px',
				padding: 40,
				zoom: true,
				hoverTooltip: true,
				maxZoom: 3,
				layer: id,
				layerSwitcher: 'top-right',
				resetButton: 'bottom-right',
				zoomButtons: 'bottom-right',
				extent: map.extent,
				geo: false
			},
			breakpoints: [
				{
					name: "all-screens",
					below: 9000,
					container: 600
				},
				{
					name: "mobile",
					below: 480,
					portrait: true
				}
			],
			layers: [
				{
					id: id,
					name: map.title,
					file: `assets/maps/world/${id.toUpperCase()}.svg`
				}
			]
		}
	}
	
	const createMap = async () => {
		try {
			await fetch(`${import.meta.env.REACT_APP_API_CALLS}mapplic-save`, {
				mode: 'no-cors',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(getData(id, map, file))
			});
			setExists(true);
		}
		catch (error) {
			console.error(error);
		}
	}

	if (!id) return null;
	return (
		<div style={{display: 'flex', flexDirection: 'row-reverse'}}>
			{ exists
				? <a className="mapplic-button mapplic-button-primary" href={`./?map=${file}`}>Open {map.title}</a>
				: <button className="mapplic-button" onClick={createMap}>Generate {file}</button>
			}
		</div>
	)
}

const DemoMap = ({ title, desc, url }) => {
  const location = useLocation();
  const isActive = location.search.includes(`?map=${url}`);
  const handleClick = () => {
    window.location.href = `/?map=${url}`;
  };
  const mapStyle = {
    cursor: 'pointer',
    border: isActive ? '2px solid black' : 'none',
  };
  return (
    <div
      className="mapplic-demo-map"
      style={mapStyle}
      onClick={handleClick}
    >
      <h4 style={{margin: '0px'}}>{title}</h4>
    </div>
  );
};